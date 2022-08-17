import { Participation, Tournament } from '@prisma/client'
import { format, utcToZonedTime } from 'date-fns-tz'
import { fr } from 'date-fns/locale'
import { EmbedBuilder } from 'discord.js'

function embedError(title: string, description: string) {
  return new EmbedBuilder().setColor(0xff3366).setTitle(title).setDescription(description)
}

function embedWarn(title: string, description: string) {
  return new EmbedBuilder().setColor(0xffd806).setTitle(title).setDescription(description)
}

function embedInfo(title: string, description: string) {
  return new EmbedBuilder().setColor(0x4a90e2).setTitle(title).setDescription(description)
}

function embedSuccess(title: string, description: string) {
  return new EmbedBuilder().setColor(0x7ed321).setTitle(title).setDescription(description)
}

export function missingName() {
  return embedError('Paramètre invalide', 'Le tournoi doit avoir un nom')
}

export function missingEndDate() {
  return embedError('Paramètre invalide', 'Le tournoi doit avoir une endDate')
}

export function invalidEndDateFormat() {
  return embedError('Paramètre invalide', "La endDate n'est pas valide. Elle doit respecter le format suivant: JJ/MM/AAAA hh:mm")
}

export function invalidEndDateValue() {
  return embedError('Paramètre invalide', "La endDate n'est pas valide. Elle doit être dans le futur.")
}

export function missingPrompt() {
  return embedError('Paramètre invalide', 'Il manque le prompt')
}

export function missingUrl() {
  return embedError('Paramètre invalide', "Il manque l'url vers l'image")
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

export function infoSuccess(tournament: Tournament, participants = 0) {
  const description = `Il y a pour l'instant ${participants} participants. Tu peux participer jusqu'au ${formatDate(tournament.endDate)}.
Pour participer, entre la commande \`/mt-register\` suivi de ton prompt et du lien vers l'image.

${tournament.description || ''}`.trim()
  return embedInfo(`Bienvenue au tournoi "${tournament.name}" !`, description)
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

export function registerSuccess(name: string) {
  const description = `Cette magnigique image est inscrite au tournoi "${name}".
Tu peux changer l'image inscrite en appelant à nouveau la commande \`/mt-register\``
  return embedSuccess('Félicitations!', description)
}

export function registerError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant l'inscription au tournoi")
}

export function acceptSuccess() {
  return embedSuccess('Félicitations!', "Tu as bien accepté les conditions d'utilisation. Tu peux désormais inscire une image avec la commande `/mt-register`")
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

export function downloadSuccess(participations: Participation[]) {
  return embedSuccess("C'est partiii !", `Waouh, on a eu ${participations.length} participants ! C'est énorme !`)
}

export function downloadError() {
  return embedError('Oh non 😿', "Une erreur s'est produite, empêchant le téléchargement des images")
}

export function alreadyRunning() {
  const description = 'Tu peux utiliser la commande `/mt-cancel` pour annuler le tournoi en cours, ou la commande `/mt-info` pour avoir des informations.'
  return embedWarn('Il y a déjà un tournoi en cours', description)
}

export function noRunning() {
  return embedInfo("Il n'y a pas de tournoi en cours en ce moment.", "Reste à l'affût, il y en aura peut-être un autre bientôt 😉")
}

export function infoParticipant(tournament: Tournament, participation: Participation) {
  const description = `Ton image a bien été inscrite au tournoi.
Tu peux la modifier jusqu'au ${formatDate(tournament.endDate)} grâce à la commande \`/mt-register\`
Prompt: \`${participation.prompt}\``
  return embedInfo(`Bienvenue au tournoi "${tournament.name}" !`, description).setImage(participation.url)
}

export function closed(tournament: Tournament) {
  return embedWarn('Oh non 😿', `Le tournoi "${tournament.name}" n'accepte plus d'inscriptions depuis le ${formatDate(tournament.endDate)}`)
}

export function alreadyRegistered() {
  return embedError("C'est pas beau de voler 😠", 'Cette image a déjà été inscrite par un autre utilisateur')
}

export function noParticipant() {
  return embedWarn('Oh non 😿', "Personne n'a participé au tournoi. Espérons qu'il y ait plus de monde la prochaine fois !")
}

export function mustAccept() {
  return embedWarn('Oh non 😿', "Tu n'as pas encore accepté les conditions d'utilisation. Pour ce faire, utilise la commande `/mt-accept`")
}

export function acceptQuestion() {
  const description = `Acceptes-tu qu'on stocke ton nom d'utilisateur ? C'est nécessaire pour participer au tournoi.
Tu pourras effacer tes données à tout moment avec la commande \`/mt-delete-data\``
  return embedInfo("Conditions d'utilisation", description)
}

export function alreadyAccepted() {
  const description = `Tu as déjà accepté les conditions d'utilisation.
Tu peux inscire une image avec la commande \`/mt-register\` ou effacer tes données à tout moment avec la commande \`/mt-delete-data\``
  return embedInfo('Déjà fait !', description)
}

export function notAccepted() {
  const description = "Ok, ton nom ne sera pas stocké, mais tu ne pourras participer au tournoi. Si tu change d'avis, tu peux à nouveau utiliser la commande `/mt-accept`"
  return embedInfo('Tant pis...', description)
}

export function deleteQuestion() {
  return embedInfo("Conditions d'utilisation", 'Veux-tu supprimer tes données ? Attention, cela supprimera également ta participation au tournoi en cours.')
}

export function alreadyDeleted() {
  return embedInfo('Déjà fait !', "Tes données ont déjà été supprimées. Si tu changes d'avis, tu peux à nouveau utiliser la commande `/mt-accept`")
}

export function notDeleted() {
  return embedInfo('Ravi que tu reste avec nous !', 'Ok, tes données seront conservées. Si tu veux les supprimer, tu peux utiliser à tout moment la commande `/mt-delete-data`')
}

export function formatDate(date: Date) {
  return format(utcToZonedTime(date, 'Europe/Paris'), `d MMMM yyyy 'à' H'h'mm`, { locale: fr })
}
