import { isAfter, parse } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import { ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js'
import { logger } from '../logger'
import { prisma } from '../prisma'
import {
  alreadyRunning,
  createError,
  createModal,
  createSuccess,
  infoSuccess,
  invalidEndDateFormat,
  invalidEndDateValue,
  missingDescription,
  missingEndDate,
  missingName,
} from '../utils/replies'

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
    const strDate = interaction.fields.getTextInputValue('endDate')
    const description = interaction.fields.getTextInputValue('description')
    if (!name) {
      await interaction.editReply({ embeds: [missingName(name, strDate, description)] })
    } else {
      if (!strDate) {
        await interaction.editReply({ embeds: [missingEndDate(name, strDate, description)] })
      } else {
        const endDate = zonedTimeToUtc(parse(strDate, 'dd/MM/yyyy HH:mm', new Date()), 'Europe/Paris')
        if (isNaN(endDate.getTime())) {
          await interaction.editReply({ embeds: [invalidEndDateFormat(name, strDate, description)] })
        } else if (!isAfter(endDate, new Date())) {
          await interaction.editReply({ embeds: [invalidEndDateValue(name, strDate, description)] })
        } else {
          if (!description) {
            await interaction.editReply({ embeds: [missingDescription(name, strDate, description)] })
          } else {
            const tournament = await prisma.tournament.create({ data: { name, endDate, description, running: true } })
            await interaction.editReply({ embeds: [createSuccess(name)] })
            await interaction.channel?.send({ embeds: [infoSuccess(tournament)] })
          }
        }
      }
    }
    action.success()
  } catch (error) {
    action.error(error)
    await interaction.editReply({ embeds: [createError()] })
  }
}
