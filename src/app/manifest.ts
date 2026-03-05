import { MetadataRoute } from 'next'
import { obterConfiguracoesLoja } from '@/lib/actions/adminSettingsActions'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const config = await obterConfiguracoesLoja();
    const storeName = config?.store_name || 'Restaurante Digital';

    return {
        name: `${storeName}`,
        short_name: storeName.substring(0, 12), // Evita nome longo no ícone do celular
        description: `Sistema de Pedidos Digitais para ${storeName}`,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FB0200',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
