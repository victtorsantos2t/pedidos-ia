/**
 * RDOS BOSS — Design Tokens & Helpers
 * 
 * TIPOGRAFIA PADRONIZADA PARA AVALIAÇÕES:
 * 
 * | Elemento         | Classe                                                    |
 * |------------------|-----------------------------------------------------------|
 * | Nome cliente     | text-sm font-bold text-gray-900 dark:text-white           |
 * | Tempo relativo   | text-[10px] font-medium text-gray-400                     |
 * | Comentário       | text-[13px] text-gray-600 dark:text-gray-400 leading-snug |
 * | Tag inline       | text-[9px] font-bold uppercase tracking-wide              |
 * | Tag bg delivery  | bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded            |
 * | Tag bg produto   | bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded          |
 * | Estrelas         | h-3 w-3, fill-amber-400 text-amber-400 (ativa)             |
 * | Estrelas inativa | h-3 w-3, text-gray-200 dark:text-gray-700                 |
 * | Botão responder  | text-[11px] font-bold text-[#FA0000]                      |
 * | Label "Respondido" | text-[10px] font-bold text-[#FA0000]                    |
 * | Avatar           | h-9 w-9 rounded-full bg-gray-100                           |
 * | Avatar inicial   | text-xs font-bold text-[#FA0000] uppercase                  |
 * 
 * RESOLUÇÃO DE NOME:
 * - Prioridade: profiles.name → orders.customer_name → "Cliente"
 * - NUNCA usar "Usuário" como fallback
 */

/**
 * Resolve o nome do cliente de uma avaliação.
 * Prioridade: profile.name > order.customer_name > "Cliente"
 */
export function resolveRatingName(rating: any): string {
    return (
        rating.profiles?.name ||
        rating.orders?.customer_name ||
        "Cliente"
    );
}

/**
 * Resolve a inicial do avatar para quando não há imagem.
 */
export function resolveRatingInitial(rating: any): string {
    const name = resolveRatingName(rating);
    return name.charAt(0).toUpperCase();
}
