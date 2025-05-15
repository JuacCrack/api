// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';

class MercadoPagoLib {
    private client: MercadoPagoConfig;

    constructor(accessToken: string) {
        this.client = new MercadoPagoConfig({ accessToken });
    }

    async createPreference(
        items: { id: string; title: string; quantity: number; unit_price: number }[],
        options?: {
            back_urls?: {
                success: string;
                failure: string;
                pending: string;
            };
            auto_return?: 'approved';
        }
    ) {
        const preference = new Preference(this.client);

        try {
            const dataRequest = {
                items,
                back_urls: options?.back_urls,
                auto_return: options?.auto_return,
            };
            console.log('Request data:', dataRequest);
            const response = await preference.create({
                body: {
                    items,
                    back_urls: options?.back_urls,
                    auto_return: options?.auto_return,
                },
            });
            return response;
        } catch (error) {
            console.error('Error creating preference:', error);
            throw error;
        }
    }
}

export default MercadoPagoLib;
