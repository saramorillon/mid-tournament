import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { cancel } from './commands/cancel'
import { close } from './commands/close'
import { create } from './commands/create'
import { info } from './commands/info'
import { register } from './commands/register'
import { run } from './commands/run'

type Command = {
  builder: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export const commands: Command[] = [
  {
    builder: new SlashCommandBuilder().setName('mt-info').setDescription('Display information about current tournament'),
    execute: info,
  },
  {
    builder: new SlashCommandBuilder()
      .setName('mt-create')
      .setDescription('Create a new tournament')
      .addStringOption((option) => option.setName('name').setDescription('Name').setRequired(true))
      .addStringOption((option) => option.setName('end-date').setDescription('End date').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: create,
  },
  {
    builder: new SlashCommandBuilder()
      .setName('mt-register')
      .setDescription('Register to the current tournament')
      .addStringOption((option) => option.setName('prompt').setDescription('Prompt').setRequired(true))
      .addStringOption((option) => option.setName('url').setDescription('Url').setRequired(true)),
    execute: register,
  },
  {
    builder: new SlashCommandBuilder().setName('mt-close').setDescription('Close current tournament registrations').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: close,
  },
  {
    builder: new SlashCommandBuilder().setName('mt-cancel').setDescription('Cancel current tournament').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: cancel,
  },
  {
    builder: new SlashCommandBuilder().setName('mt-run').setDescription('Run current tournament').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: run,
  },
]

const map: Record<string, Command> = commands.reduce((acc, curr) => ({ ...acc, [curr.builder.name]: curr }), {})

export function getCommand(name: string) {
  return map[name]
}
