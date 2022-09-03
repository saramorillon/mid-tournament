import { create, createCallback } from '../../../src/commands/create'
import { prisma } from '../../../src/prisma'
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
} from '../../../src/utils/replies'
import { mock, mockChatInteraction, mockModalInteraction, mockTournament } from '../../mocks'

describe('create', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(mockTournament())
  })

  it('should reply with already deleted message if tournament has already been created', async () => {
    const interaction = mockChatInteraction()
    await create(interaction)
    expect(interaction.reply).toHaveBeenCalledWith({ embeds: [alreadyRunning()], ephemeral: true })
  })

  it('should reply with create question if no tournament exists', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockResolvedValue(null)
    const interaction = mockChatInteraction()
    await create(interaction)
    expect(interaction.showModal).toHaveBeenCalledWith(createModal())
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.tournament, 'findFirst').mockRejectedValue(new Error('500'))
    const interaction = mockChatInteraction()
    await create(interaction)
    expect(interaction.reply).toHaveBeenCalledWith({ embeds: [createError()], ephemeral: true })
  })
})

describe('createCallback', () => {
  beforeEach(() => {
    jest.spyOn(prisma.tournament, 'create').mockResolvedValue(mockTournament())
  })

  it('should reply with missing name message if name is missing', async () => {
    const interaction = mockModalInteraction()
    mock(interaction.fields.getTextInputValue).mockReturnValue('')
    await createCallback(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [missingName('', '', '')] })
  })

  it('should reply with missing end date message if end date is missing', async () => {
    const interaction = mockModalInteraction()
    mock(interaction.fields.getTextInputValue).mockReturnValueOnce('name').mockReturnValue('')
    await createCallback(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [missingEndDate('name', '', '')] })
  })

  it('should reply with invalid date format message if end date is not valid', async () => {
    const interaction = mockModalInteraction()
    mock(interaction.fields.getTextInputValue)
      .mockReturnValueOnce('name')
      .mockReturnValueOnce('end date')
      .mockReturnValue('')
    await createCallback(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [invalidEndDateFormat('name', 'end date', '')] })
  })

  it('should reply with invlid date value message if end date is in the past', async () => {
    const interaction = mockModalInteraction()
    mock(interaction.fields.getTextInputValue)
      .mockReturnValueOnce('name')
      .mockReturnValueOnce('01/01/2000 01:00')
      .mockReturnValue('')
    await createCallback(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({
      embeds: [invalidEndDateValue('name', '01/01/2000 01:00', '')],
    })
  })

  it('should reply with missing description message if description is missing', async () => {
    const interaction = mockModalInteraction()
    mock(interaction.fields.getTextInputValue)
      .mockReturnValueOnce('name')
      .mockReturnValueOnce('01/01/2023 01:00')
      .mockReturnValue('')
    await createCallback(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [missingDescription('name', '01/01/2023 01:00', '')] })
  })

  it('should create tournament', async () => {
    const interaction = mockModalInteraction()
    mock(interaction.fields.getTextInputValue)
      .mockReturnValueOnce('name')
      .mockReturnValueOnce('01/01/2023 01:00')
      .mockReturnValueOnce('description')
    await createCallback(interaction)
    expect(prisma.tournament.create).toHaveBeenCalledWith({
      data: {
        description: 'description',
        endDate: new Date('2023-01-01T00:00:00.000Z'),
        name: 'name',
        running: true,
      },
    })
  })

  it('should reply with create success message', async () => {
    const interaction = mockModalInteraction()
    mock(interaction.fields.getTextInputValue)
      .mockReturnValueOnce('name')
      .mockReturnValueOnce('01/01/2023 01:00')
      .mockReturnValueOnce('description')
    await createCallback(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [createSuccess('name')] })
  })

  it('should follow up with info message', async () => {
    const interaction = mockModalInteraction()
    mock(interaction.fields.getTextInputValue)
      .mockReturnValueOnce('name')
      .mockReturnValueOnce('01/01/2023 01:00')
      .mockReturnValueOnce('description')
    await createCallback(interaction)
    expect(interaction.channel?.send).toHaveBeenCalledWith({ embeds: [infoSuccess(mockTournament())] })
  })

  it('should reply with error message if error', async () => {
    jest.spyOn(prisma.tournament, 'create').mockRejectedValue(new Error('500'))
    const interaction = mockModalInteraction()
    mock(interaction.fields.getTextInputValue)
      .mockReturnValueOnce('name')
      .mockReturnValueOnce('01/01/2023 01:00')
      .mockReturnValueOnce('description')
    await createCallback(interaction)
    expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [createError()] })
  })
})
