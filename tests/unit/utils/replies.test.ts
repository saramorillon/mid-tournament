import {
  cancelSuccess,
  closed,
  closeSuccess,
  createSuccess,
  downloadAttachment,
  downloadSuccess,
  formatDate,
  infoPlayer,
  infoSuccess,
  registerSuccess,
} from '../../../src/utils/replies'
import { mockParticipation, mockTournament } from '../../mocks'

describe('createSuccess', () => {
  it('should return create success message', () => {
    const result = createSuccess('name').toJSON()
    expect(result).toEqual({
      color: 8311585,
      description: 'Le tournoi "name" a bien été créé 👍',
      title: 'Félicitations!',
    })
  })
})

describe('cancelSuccess', () => {
  it('should return cancel success message', () => {
    const result = cancelSuccess('name').toJSON()
    expect(result).toEqual({
      color: 8311585,
      description: 'Le tournoi "name" a bien été annulé 👍',
      title: 'Félicitations!',
    })
  })
})

describe('infoSuccess', () => {
  it('should return info success message', () => {
    const result = infoSuccess(mockTournament()).toJSON()
    expect(result).toEqual({
      color: 4886754,
      description:
        "Il y a pour l'instant 0 joueur. Tu peux participer jusqu'au 1 janvier 2023 à 1h00.\nPour participer, entre la commande `/mt-register` suivi de ton prompt et du lien vers l'image.\n\ndescription",
      title: 'Bienvenue au tournoi "name" !',
    })
  })

  it('should return info success message with players', () => {
    const result = infoSuccess(mockTournament(), 10).toJSON()
    expect(result).toEqual({
      color: 4886754,
      description:
        "Il y a pour l'instant 10 joueurs. Tu peux participer jusqu'au 1 janvier 2023 à 1h00.\nPour participer, entre la commande `/mt-register` suivi de ton prompt et du lien vers l'image.\n\ndescription",
      title: 'Bienvenue au tournoi "name" !',
    })
  })
})

describe('closeSuccess', () => {
  it('should return close success message', () => {
    const result = closeSuccess('name').toJSON()
    expect(result).toEqual({
      color: 8311585,
      description: 'Les inscriptions au tournoi "name" ont bien été clôturé 👍',
      title: 'Félicitations!',
    })
  })
})

describe('registerSuccess', () => {
  it('should return close success message', () => {
    const result = registerSuccess('name').toJSON()
    expect(result).toEqual({
      color: 8311585,
      description:
        'Cette magnigique image est inscrite au tournoi "name".\nTu peux changer l\'image inscrite en appelant à nouveau la commande `/mt-register`',
      title: 'Félicitations!',
    })
  })
})

describe('downloadSuccess', () => {
  it('should return download success message', () => {
    const result = downloadSuccess([mockParticipation()]).toJSON()
    expect(result).toEqual({
      color: 8311585,
      description: "Waouh, on a eu 1 joueurs ! C'est énorme !",
      title: "C'est partiii !",
    })
  })
})

describe('infoPlayer', () => {
  it('should return info message for player', () => {
    const result = infoPlayer(mockTournament(), mockParticipation()).toJSON()
    expect(result).toEqual({
      color: 4886754,
      description:
        "Ton image a bien été inscrite au tournoi.\nTu peux la modifier jusqu'au 1 janvier 2023 à 1h00 grâce à la commande `/mt-register`\nPrompt: `prompt`",
      image: { url: 'http://url.com' },
      title: 'Bienvenue au tournoi "name" !',
    })
  })
})

describe('closed', () => {
  it('should return closed message', () => {
    const result = closed(mockTournament()).toJSON()
    expect(result).toEqual({
      color: 16766982,
      description: 'Le tournoi "name" n\'accepte plus d\'inscriptions depuis le 1 janvier 2023 à 1h00',
      title: 'Oh non 😿',
    })
  })
})

describe('downloadAttachment', () => {
  it('should return closed message', () => {
    const result = downloadAttachment('name', Buffer.from([])).toJSON()
    expect(result).toEqual({
      name: 'name.zip',
      attachment: { data: [], type: 'Buffer' },
    })
  })
})

describe('formatDate', () => {
  it('should format date', () => {
    const date = new Date()
    expect(formatDate(date)).toBe('1 janvier 2022 à 1h00')
  })
})
