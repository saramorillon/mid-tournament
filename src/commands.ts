import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { accept } from './commands/accept'
import { cancel } from './commands/cancel'
import { close } from './commands/close'
import { create } from './commands/create'
import { deleteData } from './commands/delete'
import { download } from './commands/download'
import { info } from './commands/info'
import { register } from './commands/register'

type Command = {
  builder: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export const commands: Command[] = [
  {
    builder: new SlashCommandBuilder()
      .setName('mt-info')
      .setDescription('Afficher les informations à propos du tournoi en cours'),
    execute: info,
  },
  {
    builder: new SlashCommandBuilder()
      .setName('mt-create')
      .setDescription('Créer un nouveau tournoi')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: create,
  },
  {
    builder: new SlashCommandBuilder().setName('mt-accept').setDescription('Consentir au stockage des données'),
    execute: accept,
  },
  {
    builder: new SlashCommandBuilder().setName('mt-delete-data').setDescription('Supprimer les données'),
    execute: deleteData,
  },
  {
    builder: new SlashCommandBuilder()
      .setName('mt-register')
      .setDescription("S'inscrire au tournoi")
      .addStringOption((option) => option.setName('prompt').setDescription('Prompt').setRequired(true))
      .addStringOption((option) => option.setName('url').setDescription('Url').setRequired(true)),
    execute: register,
  },
  {
    builder: new SlashCommandBuilder()
      .setName('mt-close')
      .setDescription('Clôturer les inscriptions au tournoi')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: close,
  },
  {
    builder: new SlashCommandBuilder()
      .setName('mt-cancel')
      .setDescription('Annuler le tournoi')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: cancel,
  },
  {
    builder: new SlashCommandBuilder()
      .setName('mt-download')
      .setDescription('Télécharger toutes les images du tournoi')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: download,
  },
]

export const commandsMap: Record<string, Command> = commands.reduce(
  (acc, curr) => ({ ...acc, [curr.builder.name]: curr }),
  {}
)
