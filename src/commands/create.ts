import { isAfter, parse } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import { ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js'
import { logger } from '../logger'
import { prisma } from '../prisma'
import { alreadyRunning, createError, createModal, createSuccess, infoSuccess, invalidEndDateFormat, invalidEndDateValue, missingEndDate, missingName } from '../utils/replies'

export async function create(interaction: ChatInputCommandInteraction) {
  const action = logger.start('create')
  try {
    const lastTournament = await prisma.tournament.findFirst({ where: { running: true }, orderBy: { endDate: 'desc' } })
    if (lastTournament) {
      await interaction.reply({ embeds: [alreadyRunning()], ephemeral: true })
    } else {
      await interaction.showModal(createModal())
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.reply({ embeds: [createError()], ephemeral: true })
  }
}

export async function createCallback(interaction: ModalSubmitInteraction) {
  const action = logger.start('create_callback', { fields: interaction.fields.fields })
  await interaction.deferReply({ ephemeral: true })
  try {
    const name = interaction.fields.getTextInputValue('name')
    if (!name) {
      await interaction.editReply({ embeds: [missingName()] })
    } else {
      const endDate = interaction.fields.getTextInputValue('endDate')
      if (!endDate) {
        await interaction.editReply({ embeds: [missingEndDate()] })
      } else {
        const parsedDate = zonedTimeToUtc(parse(endDate, 'dd/MM/yyyy HH:mm', new Date()), 'Europe/Paris')
        if (isNaN(parsedDate.getTime())) {
          await interaction.editReply({ embeds: [invalidEndDateFormat()] })
        } else if (!isAfter(parsedDate, new Date())) {
          await interaction.editReply({ embeds: [invalidEndDateValue()] })
        } else {
          const description = interaction.fields.getTextInputValue('description') || null
          const tournament = await prisma.tournament.create({ data: { name, endDate: parsedDate, description, running: true } })
          await interaction.editReply({ embeds: [createSuccess(name)] })
          await interaction.followUp({ embeds: [infoSuccess(tournament)] })
        }
      }
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [createError()] })
  }
}
