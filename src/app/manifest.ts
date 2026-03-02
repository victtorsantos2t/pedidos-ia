import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'RDOS - Restaurante Digital',
        short_name: 'RDOS',
        description: 'Sistema de Pedidos Digitais para Restaurantes',
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
