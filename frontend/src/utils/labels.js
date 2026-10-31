export const CATEGORY_LABELS = {
    NETWORK: 'Réseau',
    MALWARE: 'Malware',
    PHISHING: 'Phishing',
    ACCESS: 'Accès',
    SOFTWARE: 'Logiciel',
    HARDWARE: 'Matériel',
    DATA_LEAK: 'Fuite de données',
    OTHER: 'Autre',
}

export const PRIORITY_LABELS = {
    LOW: 'Faible',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute',
    CRITICAL: 'Critique',
}

export const STATUS_LABELS = {
    OPEN: 'Ouvert',
    ASSIGNED: 'Affecté',
    IN_PROGRESS: 'En cours',
    RESOLVED: 'Résolu',
    CLOSED: 'Clôturé',
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
})

/** "2026-10-31T04:13:27.123" -> "31/10/2026 04:13" */
export function formatDate(value) {
    return value ? dateFormatter.format(new Date(value)) : '—'
}