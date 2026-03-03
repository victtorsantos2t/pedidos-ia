export type DeliveryZone = {
    id: string;
    nome: string;
    raio_min_km: number;
    raio_max_km: number;
    taxa_base: number;
    valor_km_extra: number;
    pedido_minimo: number;
    frete_gratis_acima: number;
    ativo: boolean;
};

export type DeliveryCalculationResult = {
    zona: string;
    distancia: number;
    taxaEntrega: number;
    freteGratis: boolean;
    pedidoMinimo: number;
    tempoEstimadoMin: number;
    error?: string;
};
