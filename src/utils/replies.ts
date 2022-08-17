import { Participation } from '@prisma/client'
import { format } from 'date-fns-tz'
import { fr } from 'date-fns/locale'
import { EmbedBuilder } from 'discord.js'

function embedError() {
  return new EmbedBuilder().setColor(0xff3366)
}

function embedWarn() {
  return new EmbedBuilder().setColor(0xffd806)
}

function embedInfo() {
  return new EmbedBuilder().setColor(0x4a90e2)
}

function embedSuccess() {
  return new EmbedBuilder().setColor(0x7ed321)
}

export function missingName() {
  return embedError().setTitle('Paramètre invalide').setDescription('Le tournoi doit avoir un nom')
}

export function missingEndDate() {
  return embedError().setTitle('Paramètre invalide').setDescription('Le tournoi doit avoir une endDate')
}

export function invalidEndDateFormat() {
  return embedError().setTitle('Paramètre invalide').setDescription("La endDate n'est pas valide. Elle doit respecter le format suivant: JJ/MM/AAAA hh:mm")
}

export function invalidEndDateValue() {
  return embedError().setTitle('Paramètre invalide').setDescription("La endDate n'est pas valide. Elle doit être dans le futur.")
}

export function missingPrompt() {
  return embedError().setTitle('Paramètre invalide').setDescription('Il manque le prompt')
}

export function missingUrl() {
  return embedError().setTitle('Paramètre invalide').setDescription("Il manque l'url vers l'image")
}

export function createSuccess(name: string) {
  return embedSuccess().setTitle('Félicitations!').setDescription(`Le tournoi "${name}" a bien été créé 👍`)
}

export function createError() {
  return embedError().setTitle('Oh non 😿').setDescription("Une erreur s'est produite, empêchant la création du tournoi")
}

export function cancelSuccess(name: string) {
  return embedSuccess().setTitle('Félicitations!').setDescription(`Le tournoi "${name}" a bien été annulé 👍`)
}

export function cancelError() {
  return embedError().setTitle('Oh non 😿').setDescription("Une erreur s'est produite, empêchant l'annulation du tournoi")
}

export function infoSuccess(name: string, date: Date, participants = 0) {
  return embedInfo()
    .setTitle(`Bienvenue au tournoi "${name}" !`)
    .setDescription(
      `Il y a pour l'instant ${participants} participants. Tu peux participer jusqu'au ${formatDate(date)}.
Pour participer, entre la commande \`/mt-register\` suivi de ton prompt et du lien vers l'image.`
    )
}

export function infoError() {
  return embedError().setTitle('Oh non 😿').setDescription("Une erreur s'est produite, empêchant d'accéder aux informations du tournoi en cours")
}

export function closeSuccess(name: string) {
  return embedSuccess().setTitle('Félicitations!').setDescription(`Les inscriptions au tournoi "${name}" ont bien été clôturé 👍`)
}

export function closeError() {
  return embedError().setTitle('Oh non 😿').setDescription("Une erreur s'est produite, empêchant de clôturer les inscriptions au tournoi")
}

export function registerSuccess(name: string) {
  return embedSuccess().setTitle('Félicitations!').setDescription(`Cette magnigique image est inscrite au tournoi "${name}".
Tu peux changer l'image inscrite en appelant à nous la command \`/mt-register\``)
}

export function registerError() {
  return embedError().setTitle('Oh non 😿').setDescription("Une erreur s'est produite, empêchant l'inscription au tournoi")
}

export function downloadSuccess(participations: Participation[]) {
  return embedSuccess().setTitle("C'est partiii !").setDescription(`Waouh, on a eu ${participations.length} participants ! C'est énorme !`)
}

export function downloadError() {
  return embedError().setTitle('Oh non 😿').setDescription("Une erreur s'est produite, empêchant le téléchargement des images")
}

export function alreadyRunning() {
  return embedWarn()
    .setTitle('Il y a déjà un tournoi en cours')
    .setDescription('Tu peux utiliser la commande `/mt-cancel` pour annuler le tournoi en cours, ou la commande `/mt-info` pour avoir des informations.')
}

export function noRunning() {
  return embedInfo().setTitle("Il n'y a pas de tournoi en cours en ce moment.").setDescription("Reste à l'affût, il y en aura peut-être un autre bientôt 😉")
}

export function infoParticipant(name: string, date: Date, participation: Participation) {
  return embedInfo()
    .setTitle(`Bienvenue au tournoi "${name}" !`)
    .setDescription(
      `Ton image a bien été inscrite au tournoi.
Tu peux la modifier jusqu'au ${formatDate(date)} grâce à la commande \`/mt-register\`
Prompt: \`${participation.prompt}\``
    )
    .setImage(participation.url)
}

export function closed(name: string, date: Date) {
  return embedWarn()
    .setTitle('Oh non 😿')
    .setDescription(`Le tournoi "${name}" n'accepte plus d'inscriptions depuis le ${formatDate(date)}`)
}

export function alreadyRegistered() {
  return embedError().setTitle("C'est pas beau de voler 😠").setDescription('Cette image a déjà été inscrite par un autre utilisateur')
}

export function noParticipant() {
  return embedWarn().setTitle('Oh non 😿').setDescription("Personne n'a participé au tournoi. Espérons qu'il y ait plus de monde la prochaine fois !")
}

function formatDate(date: Date) {
  return format(date, `dd MMMM yyyy 'à' H'h'mm`, { timeZone: 'Europe/Paris', locale: fr })
}
