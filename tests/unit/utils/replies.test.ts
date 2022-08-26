import { version } from '../../../package.json'
import {
  cancelSuccess,
  closed,
  closeSuccess,
  createSuccess,
  downloadAttachment,
  downloadSuccess,
  formatDate,
  helpSuccess,
  infoSuccess,
  newPlayer,
  registerSuccess,
} from '../../../src/utils/replies'
import { mockDiscordUser, mockParticipation, mockTournament } from '../../mocks'

describe('createSuccess', () => {
  it('should return create success message', () => {
    const result = createSuccess('name').toJSON()
    expect(result).toEqual({
      color: 8311585,
      description: 'Le tournoi "name" a bien été créé 👍',
      title: 'Félicitations!',
      footer: { text: `MidTournament Bot, v${version}` },
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
      footer: { text: `MidTournament Bot, v${version}` },
    })
  })
})

describe('helpSuccess', () => {
  it('should return help success message', () => {
    const result = helpSuccess().toJSON()
    expect(result).toEqual({
      color: 4886754,
      description: expect.not.stringContaining('mt-create'),
      title: 'Aide',
      footer: { text: `MidTournament Bot, v${version}` },
    })
  })

  it('should return help success message for admin', () => {
    const result = helpSuccess(true).toJSON()
    expect(result).toEqual({
      color: 4886754,
      description: expect.stringContaining('mt-create'),
      title: 'Aide',
      footer: { text: `MidTournament Bot, v${version}` },
    })
  })
})

describe('infoSuccess', () => {
  it('should return info success message', () => {
    const result = infoSuccess(mockTournament()).toJSON()
    expect(result).toEqual({
      color: 4886754,
      description:
        "**Date de fin** : 1 janvier 2023 à 1h00\n**Règles du tournoi** :\ndescription\n\nIl y a pour l'instant 0 joueur !\n\nPour participer, entre la commande `/mt-register` suivi de ton prompt et du lien vers l'image.",
      title: 'Bienvenue au tournoi "name" !',
      footer: { text: `MidTournament Bot, v${version}` },
    })
  })

  it('should return info success message with players', () => {
    const result = infoSuccess(mockTournament(), 10).toJSON()
    expect(result).toEqual({
      color: 4886754,
      description:
        "**Date de fin** : 1 janvier 2023 à 1h00\n**Règles du tournoi** :\ndescription\n\nIl y a pour l'instant 10 joueurs !\n\nPour participer, entre la commande `/mt-register` suivi de ton prompt et du lien vers l'image.",
      title: 'Bienvenue au tournoi "name" !',
      footer: { text: `MidTournament Bot, v${version}` },
    })
  })

  it('should return info success with participation', () => {
    const result = infoSuccess(mockTournament(), 10, mockParticipation()).toJSON()
    expect(result).toEqual({
      color: 4886754,
      description:
        "**Date de fin** : 1 janvier 2023 à 1h00\n**Règles du tournoi** :\ndescription\n\nIl y a pour l'instant 10 joueurs !\n\nMerci d'avoir participé ! Tu peux modifier ton image grâce à la commande `/mt-register`.\n\n**Prompt** : `prompt`",
      title: 'Bienvenue au tournoi "name" !',
      image: { url: 'http://url.com' },
      footer: { text: `MidTournament Bot, v${version}` },
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
      footer: { text: `MidTournament Bot, v${version}` },
    })
  })
})

describe('registerSuccess', () => {
  it('should return register success message', () => {
    const result = registerSuccess('name', mockParticipation()).toJSON()
    expect(result).toEqual({
      color: 8311585,
      description:
        'Cette magnigique image est inscrite au tournoi "name".\nTu peux modifier ton image grâce à la commande `/mt-register`.\n\n**Prompt** : `prompt`',
      title: 'Félicitations!',
      image: { url: 'http://url.com' },
      footer: { text: `MidTournament Bot, v${version}` },
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
      footer: { text: `MidTournament Bot, v${version}` },
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
      footer: { text: `MidTournament Bot, v${version}` },
    })
  })
})

describe('newPlayer', () => {
  it('should return new player message', () => {
    const result = newPlayer(mockDiscordUser(), 'name').toJSON()
    expect(result).toEqual({
      color: 4886754,
      description:
        'username participe au tournoi "name" !\nTu veux participer ? Crée ton image et enregistre là avec la commande `/mt-register` !',
      title: 'Un nouveau joueur entre en lice !',
      thumbnail: { url: 'http://avatar-url.com' },
      footer: { text: `MidTournament Bot, v${version}` },
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
