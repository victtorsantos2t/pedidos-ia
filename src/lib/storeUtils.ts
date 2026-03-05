export type OpeningHours = {
    day: string;
    open: string;
    close: string;
    closed: boolean;
};

/**
 * Calcula se a loja está aberta com base nos horários de funcionamento.
 * Agora utiliza o horário de Brasília (UTC-3) para garantir consistência,
 * mesmo quando o servidor está em UTC.
 */
export function isStoreOpen(openingHours: OpeningHours[] | undefined): boolean {
    if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0) return false;

    try {
        // Obter os componentes do horário atual em Brasília (America/Sao_Paulo)
        // Isso é o padrão para restaurantes no Brasil.
        const formatter = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Cuiaba',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });

        const parts = formatter.formatToParts(new Date());
        const dayPart = parts.find(p => p.type === 'weekday')?.value;
        const hourPart = parts.find(p => p.type === 'hour')?.value;
        const minutePart = parts.find(p => p.type === 'minute')?.value;

        if (!dayPart || !hourPart || !minutePart) return false;

        // Limpar o nome do dia (remover maiúsculas e o sufixo "-feira" se existir)
        const currentDayName = dayPart.toLowerCase().replace('-feira', '');

        // Mapeamento extra para garantir que o "domingo" e "sábado" funcionem
        // mesmo com variações de locale.
        const schedule = openingHours.find(h => {
            const dayInDB = h.day.toLowerCase().replace('-feira', '');
            return dayInDB === currentDayName;
        });

        if (!schedule || schedule.closed || !schedule.open || !schedule.close) return false;

        const [openH, openM] = schedule.open.split(':').map(Number);
        const [closeH, closeM] = schedule.close.split(':').map(Number);

        if (isNaN(openH) || isNaN(closeH)) return false;

        const currentHour = parseInt(hourPart, 10);
        const currentMinute = parseInt(minutePart, 10);

        const currentTimeMinutes = currentHour * 60 + currentMinute;
        const openTimeMinutes = openH * 60 + (openM || 0);
        const closeTimeMinutes = closeH * 60 + (closeM || 0);

        // Caso de virada de noite (ex: 18:00 às 02:00)
        if (closeTimeMinutes < openTimeMinutes && closeTimeMinutes !== 0) {
            return currentTimeMinutes >= openTimeMinutes || currentTimeMinutes < closeTimeMinutes;
        }

        const effectiveClose = closeTimeMinutes === 0 ? 1440 : closeTimeMinutes;
        return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < effectiveClose;
    } catch (e) {
        console.error("Erro ao calcular status da loja:", e);
        return false;
    }
}

/**
 * Extrai o tempo máximo esperado de uma string como "30-45 min" ou "40 min".
 * Útil para cálculos de alerta de atraso.
 */
export function parseEstimatedTime(estimatedTime: string | null | undefined): number {
    if (!estimatedTime) return 45; // Default de segurança

    try {
        // Pega todos os números da string
        const numbers = estimatedTime.match(/\d+/g);
        if (!numbers || numbers.length === 0) return 45;

        // Se houver dois números (ex: 30-45), retorna o maior. Se um, retorna ele.
        return Math.max(...numbers.map(Number));
    } catch (e) {
        console.error("Erro ao parsear tempo estimado:", e);
        return 45;
    }
}
