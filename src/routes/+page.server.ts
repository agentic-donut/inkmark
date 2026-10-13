import {publicSettings} from '#lib/domain/catalog/index.ts';
import {getCatalogSettingsRepository} from '#lib/server/catalog/index.ts';
import type {PageServerLoad} from './$types';

export const load: PageServerLoad = async () => ({
	settings: publicSettings(await getCatalogSettingsRepository().load())
});
