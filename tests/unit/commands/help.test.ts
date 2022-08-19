import { GuildMember } from 'discord.js'
import { help } from '../../../src/commands/help'
import { prisma } from '../../../src/prisma'
import { helpError, helpSuccess } from '../../../src/utils/replies'
import { mockChatInteraction, mockParticipation, mockTournamentWithCount } from '../../mocks'

describe('help', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(null)
    jest.spyOn(prisma.participation, 'findFirst').mockResolvedValue(null)
  })

  it('should reply with help success message if interaction member is not defined', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournamentWithCount())
    const interaction = mockChatInteraction()
    await help(interaction)
    expect(interaction.reply).toHaveBeenCalledWith({ embeds: [helpSuccess()], ephemeral: true })
  })

  it('should reply with help success message if interaction member has string role', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournamentWithCount())
    const interaction = mockChatInteraction()
    interaction.member = { permissions: '' } as unknown as GuildMember
    await help(interaction)
    expect(interaction.reply).toHaveBeenCalledWith({ embeds: [helpSuccess()], ephemeral: true })
  })

  it('should reply with help success message if interaction member is not admin', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournamentWithCount())
    jest.spyOn(prisma.participation, 'findFirst').mockResolvedValue(mockParticipation())
    const interaction = mockChatInteraction()
    interaction.member = { permissions: { has: () => false } } as unknown as GuildMember
    await help(interaction)
    expect(interaction.reply).toHaveBeenCalledWith({ embeds: [helpSuccess(false)], ephemeral: true })
  })

  it('should reply with help success message if interaction member is admin', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournamentWithCount())
    jest.spyOn(prisma.participation, 'findFirst').mockResolvedValue(mockParticipation())
    const interaction = mockChatInteraction()
    interaction.member = { permissions: { has: () => true } } as unknown as GuildMember
    await help(interaction)
    expect(interaction.reply).toHaveBeenCalledWith({ embeds: [helpSuccess(true)], ephemeral: true })
  })

  it('should reply with error message if error', async () => {
    const interaction = mockChatInteraction()
    interaction.member = {} as unknown as GuildMember
    await help(interaction)
    expect(interaction.reply).toHaveBeenCalledWith({ embeds: [helpError()], ephemeral: true })
  })
})
