import { Participation, Tournament } from '@prisma/client'
import { format, utcToZonedTime } from 'date-fns-tz'
import { fr } from 'date-fns/locale'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  User,
} from 'discord.js'
import { version } from '../../package.json'
import { settings } from '../settings'

function embedError(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(0xff3366)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `MidTournament Bot, v${version}` })
}

function embedWarn(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(0xffd806)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `MidTournament Bot, v${version}` })
}

function embedInfo(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(0x4a90e2)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `MidTournament Bot, v${version}` })
}

function embedSuccess(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(0x7ed321)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `MidTournament Bot, v${version}` })
}

export function missingName(name: string, strDate: string, desc: string) {
  const description = `Le tournoi doit avoir un nom.
Nom: ${name}
Date: ${strDate}
Description: ${desc}`
  return embedError('Paramètre invalide', description)
}

export function missingEndDate(name: string, strDate: string, desc: string) {
  const description = `Le tournoi doit avoir une date de fin.
Nom: ${name}
Date: ${strDate}
Description: ${desc}`
  return embedError('Paramètre invalide', description)
}

export function missingDescription(name: string, strDate: string, desc: string) {
  const description = `Le tournoi doit avoir une description.
Nom: ${name}
Date: ${strDate}
Description: ${desc}`
  return embedError('Paramètre invalide', description)
}

export function invalidEndDateFormat(name: string, strDate: string, desc: string) {
  const description = `La date de fin n'est pas valide. Elle doit respecter le format suivant: JJ/MM/AAAA hh:mm. Attention aux espaces !
Nom: ${name}
Date: ${strDate}
Description: ${desc}`
  return embedError('Paramètre invalide', description)
}

export function invalidEndDateValue(name: string, strDate: string, desc: string) {
  const description = `La date de fin n'est pas valide. Elle doit être dans le futur.
Nom: ${name}
Date: ${strDate}
Description: ${desc}`
  return embedError('Paramètre invalide', description)
}

export function missingPrompt() {
  return embedError('Paramètre invalide', 'Il manque le prompt')
}

export function missingUrl() {
  return embedError('Paramètre invalide', "Il manque l'url vers l'image")
}

export function invalidUrl() {
  return embedError('Paramètre invalide', "L'url doit être une url valide")
}

export function createSuccess(name: string) {
  return embedSuccess('Félicitations!', `Le tournoi "${name}" a bien été créé 👍`)
}

export function createError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant la création du tournoi")
}

export function cancelSuccess(name: string) {
  return embedSuccess('Félicitations!', `Le tournoi "${name}" a bien été annulé 👍`)
}

export function cancelError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant l'annulation du tournoi")
}

export function helpSuccess(admin = false) {
  const help = `\`/mt-help\`
Cette commande permet d'afficher ce message d'aide.
  
\`/mt-info\`
Cette commande permet d'afficher des informations concernant le tournoi en cours et ta participation.
  
\`/mt-accept\`
Cette commande permet d'accepter les conditions d'utilisation. Il est nécessaire de l'utiliser une fois pour pourquoi participer aux différents tournois.
  
\`/mt-delete-data\`
Cette commande permet de supprimer tes informations (nom d'utilisateur) qui sont stockées sur mon serveur. Attention, cela supprime également toutes tes participations à tous les tournois.
  
\`/mt-register\`
Cette commande permet de participer au tournoi en cours, en fournissant le prompt utilisé et l'url vers image générée.`

  const adminHelp = `

**Commandes administrateurs**

\`/mt-create\`
Cette commande permet de créer un nouveau tournoi en renseignant : le nom, la date de fin et une description.
  
\`/mt-cancel\`
Cette commande permet d'annuler le tournoi en cours.
  
\`/mt-close\`
Cette commande permet de clôturer les inscriptions au tournoi en cours. Sinon, elles seront automatiquement clôturées à la date indiquée lors de la création.
  
\`/mt-download\`
Cette commande permet de télécharger toutes les images inscrites au tournoi. Chaque image est nommée avec le nom de l'utilisateur discord qui l'a postée. Un fichier "promptoscope.csv" est joint au téléchargement. Il contient la liste des joueurs avec leur prompt et l'url postée.
*Note: les fichiers ".csv" s'ouvrent avec un tableur comme excel ou ses alternatives gratuites. Il peut également s'ouvrir avec un bloc note.*

`
  return embedInfo('Aide', help + (admin ? adminHelp : ''))
}

export function helpError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant d'afficher l'aide")
}

export function infoSuccess(tournament: Tournament, players = 0, participation?: Participation) {
  const s = players > 1 ? 's' : ''
  let description = `**Date de fin** : ${formatDate(tournament.endDate)}
**Règles du tournoi** :
${tournament.description}

Il y a pour l'instant ${players} joueur${s} !

`

  if (!participation) {
    description += "Pour participer, entre la commande `/mt-register` suivi de ton prompt et du lien vers l'image."
    return embedInfo(`Bienvenue au tournoi "${tournament.name}" !`, description)
  }

  description += `Merci d'avoir participé ! Tu peux modifier ton image grâce à la commande \`/mt-register\`.

**Prompt** : \`${participation.prompt}\``

  return embedInfo(`Bienvenue au tournoi "${tournament.name}" !`, description).setImage(participation.url)
}

export function infoError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant d'accéder aux informations du tournoi en cours")
}

export function closeSuccess(name: string) {
  return embedSuccess('Félicitations!', `Les inscriptions au tournoi "${name}" ont bien été clôturé 👍`)
}

export function closeError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant de clôturer les inscriptions au tournoi")
}

export function registerSuccess(name: string, participation: Participation) {
  const description = `Cette magnifique image est inscrite au tournoi "${name}".
Tu peux modifier ton image grâce à la commande \`/mt-register\`.

**Prompt** : \`${participation.prompt}\``
  return embedSuccess('Félicitations!', description).setImage(participation.url)
}

export function registerError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant l'inscription au tournoi")
}

export function acceptSuccess() {
  const description =
    "Tu as bien accepté les conditions d'utilisation. Tu peux désormais inscire une image avec la commande `/mt-register`"
  return embedSuccess('Félicitations!', description)
}

export function acceptError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant l'acceptation des conditions d'utilisation")
}

export function deleteSuccess() {
  const description = `Tes données ont bien été supprimées. Tu ne peux plus participer aux tournois.
Si tu changes d'avis, tu peux à nouveau utiliser la commande \`/mt-accept\``
  return embedSuccess('Félicitations!', description)
}

export function deleteError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant la suppression de tes données.")
}

export function downloadSuccess(path: string, participations: Participation[]) {
  const url = new URL(`/download?path=${encodeURI(path)}`, settings.app.host).toString()
  const description = `Waouh, on a eu ${participations.length} joueurs ! C'est énorme !`
  return embedSuccess('Clique ici pour télécharger le zip', description).setURL(url)
}

export function downloadError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant le téléchargement des images")
}

export function alreadyRunning() {
  const description =
    'Tu peux utiliser la commande `/mt-cancel` pour annuler le tournoi en cours, ou la commande `/mt-info` pour avoir des informations.'
  return embedWarn('Il y a déjà un tournoi en cours', description)
}

export function createModal() {
  const name = new TextInputBuilder().setCustomId('name').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired()
  const endDate = new TextInputBuilder()
    .setCustomId('endDate')
    .setLabel('Date de fin')
    .setStyle(TextInputStyle.Short)
    .setRequired()
    .setPlaceholder('JJ/MM/AAAA hh:mm')
    .setMaxLength(16)
  const description = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)

  return new ModalBuilder()
    .setCustomId('create')
    .setTitle('Créer un tournoi')
    .setComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(name),
      new ActionRowBuilder<TextInputBuilder>().addComponents(endDate),
      new ActionRowBuilder<TextInputBuilder>().addComponents(description)
    )
}

export function noRunning() {
  return embedInfo(
    "Il n'y a pas de tournoi en cours en ce moment.",
    "Reste à l'affût, il y en aura peut-être un autre bientôt 😉"
  )
}

export function closed(tournament: Tournament) {
  const endDate = formatDate(tournament.endDate)
  const description = `Le tournoi "${tournament.name}" n'accepte plus d'inscriptions depuis le ${endDate}`
  return embedWarn('Oh non 😿', description)
}

export function alreadyRegistered() {
  return embedError("C'est pas beau de voler 😠", 'Cette image a déjà été inscrite par un autre utilisateur')
}

export function noPlayer() {
  const description = "Personne n'a participé au tournoi. Espérons qu'il y ait plus de monde la prochaine fois !"
  return embedWarn('Oh non 😿', description)
}

export function newPlayer(user: User, name: string) {
  const description = `${user.username} participe au tournoi "${name}" !
Tu veux participer ? Crée ton image et enregistre-la avec la commande \`/mt-register\` !`
  return embedInfo('Un nouveau joueur entre en lice !', description).setThumbnail(user.avatarURL())
}

export function mustAccept() {
  const description =
    "Tu n'as pas encore accepté les conditions d'utilisation. Pour ce faire, utilise la commande `/mt-accept`"
  return embedWarn('Oh non 😿', description)
}

export function acceptQuestion() {
  const description = `Acceptes-tu qu'on stocke ton nom d'utilisateur ? C'est nécessaire pour participer au tournoi.
Tu pourras effacer tes données à tout moment avec la commande \`/mt-delete-data\``
  return embedInfo("Conditions d'utilisation", description)
}

export function acceptButtons() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('accept-yes').setLabel('Oui !').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('accept-no').setLabel('Non !').setStyle(ButtonStyle.Danger)
  )
}

export function alreadyAccepted() {
  const description = `Tu as déjà accepté les conditions d'utilisation.
Tu peux inscire une image avec la commande \`/mt-register\` ou effacer tes données à tout moment avec la commande \`/mt-delete-data\``
  return embedInfo('Déjà fait !', description)
}

export function notAccepted() {
  const description =
    "Ok, ton nom ne sera pas stocké, mais tu ne pourras participer au tournoi. Si tu change d'avis, tu peux à nouveau utiliser la commande `/mt-accept`"
  return embedInfo('Tant pis...', description)
}

export function deleteQuestion() {
  const description =
    'Veux-tu supprimer tes données ? Attention, cela supprimera également ta participation au tournoi en cours.'
  return embedInfo("Conditions d'utilisation", description)
}

export function deleteButtons() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('delete-yes').setLabel('Oui !').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('delete-no').setLabel('Non !').setStyle(ButtonStyle.Danger)
  )
}

export function alreadyDeleted() {
  const description =
    "Tes données ont déjà été supprimées. Si tu changes d'avis, tu peux à nouveau utiliser la commande `/mt-accept`"
  return embedInfo('Déjà fait !', description)
}

export function notDeleted() {
  const description =
    'Ok, tes données seront conservées. Si tu veux les supprimer, tu peux utiliser à tout moment la commande `/mt-delete-data`'
  return embedInfo('Ravi que tu reste avec nous !', description)
}

export function downloadProgress(progress: number) {
  return embedInfo('Génération du zip en cours...', `${Math.round(progress * 100)}%`)
}

export function formatDate(date: Date) {
  return format(utcToZonedTime(date, 'Europe/Paris'), `d MMMM yyyy 'à' H'h'mm`, { locale: fr })
}

export function missingPath() {
  return `<!doctype html>
<html>
  <head>
    <title>Invalid url</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/@saramorillon/minicss@1.2.0/dist/minicss.css" rel="stylesheet" />
  </head>
  <body>
    <main>
      <h1>Erreur 404</h1>
      Il semble que cette page n'existe pas ='(
    </main>
  </body>
</html>`
}

export function missingFile() {
  return `<!doctype html>
  <html>
    <head>
      <title>Missing file</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@saramorillon/minicss@1.2.0/dist/minicss.css" rel="stylesheet" />
    </head>
    <body>
      <main>
        <h1>Erreur 404</h1>
        Le fichier demandé n'existe plus ! Tu peux le régénérer avec la commande <code>/mt-download</code>
      </main>
    </body>
  </html>`
}

export function unexpectedError() {
  return `<!doctype html>
  <html>
    <head>
      <title>Missing file</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@saramorillon/minicss@1.2.0/dist/minicss.css" rel="stylesheet" />
    </head>
    <body>
      <main>
        <h1>Erreur</h1>
        Une erreur empêche le téléchargement du fichier ='(
      </main>
    </body>
  </html>`
}
