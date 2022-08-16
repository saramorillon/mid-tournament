import { isAfter, parse } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import { ChatInputCommandInteraction } from 'discord.js'
import { prisma } from '../prisma'
import { alreadyRunning, createError, createSuccess, infoSuccess, invalidEndDateFormat, invalidEndDateValue, missingEndDate, missingName } from '../utils/replies'

export async function create(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const lastTournament = await prisma.tournament.findFirst({ where: { running: true }, orderBy: { endDate: 'desc' } })
    if (lastTournament) {
      await interaction.editReply({ embeds: [alreadyRunning()] })
      return
    }

    const name = interaction.options.getString('name')
    if (!name) {
      await interaction.editReply({ embeds: [missingName()] })
      return
    }

    const endDate = interaction.options.getString('end-date')
    if (!endDate) {
      await interaction.editReply({ embeds: [missingEndDate()] })
      return
    }

    const parsedDate = zonedTimeToUtc(parse(endDate, 'dd/MM/yyyy HH:mm', new Date()), 'Europe/Paris')
    if (isNaN(parsedDate.getTime())) {
      await interaction.editReply({ embeds: [invalidEndDateFormat()] })
      return
    }

    if (!isAfter(parsedDate, new Date())) {
      await interaction.editReply({ embeds: [invalidEndDateValue()] })
      return
    }

    await prisma.tournament.create({ data: { name, endDate: parsedDate, running: true } })
    await interaction.editReply({ embeds: [createSuccess(name)] })
    await interaction.followUp({ embeds: [infoSuccess(name, parsedDate)] })
  } catch (error) {
    console.error(error)
    await interaction.editReply({ embeds: [createError()] })
  }
}
