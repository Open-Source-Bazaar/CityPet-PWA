import 'core-js/full/array/from-async';

import { Base, ListChunk } from '@idea2app/data-server';
import { HTTPClient } from 'koajax';
import { githubClient, RepositoryModel } from 'mobx-github';
import { Filter, IDType, ListModel, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { API_Host, GITHUB_TOKEN } from './configuration';

export const ownClient = new HTTPClient({
  baseURI: `${API_Host}/api/`,
  responseType: 'json',
});

githubClient.use(({ request }, next) => {
  if (GITHUB_TOKEN)
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    };

  return next();
});

export const repositoryStore = new RepositoryModel('open-source-bazaar');

type UploadedFile = Record<'originalname' | 'filename' | 'location', string>;

/**
 * Uploads a file blob to the remote file service.
 *
 * @param file - File blob to upload.
 * @returns Hosted URL location of the uploaded file.
 */
export async function upload(file: Blob) {
  const form = new FormData();
  form.append('file', file);

  const { body } = await ownClient.post<UploadedFile>(
    'https://api.escuelajs.co/api/v1/files/upload',
    form,
  );

  return body!.location;
}

/**
 * Abstract table model providing paginated listing and record manipulation.
 */
export abstract class TableModel<
  D extends Base,
  F extends Filter<D> = Filter<D>,
> extends ListModel<D, F> {
  /**
   * Updates or creates a record in the collection.
   *
   * @param data - Record attributes to persist.
   * @param id - Optional record identifier for updating an existing item.
   * @returns Persisted record entity.
   */
  @toggle('uploading')
  async updateOne(data: Filter<D>, id?: IDType) {
    const { body } = await (id
      ? this.client.put<D>(`${this.baseURI}/${id}`, data)
      : this.client.post<D>(this.baseURI, data));

    if (id) this.changeOne(body!, id);
    else this.restoreList({ allItems: [body!, ...this.allItems] });

    return (this.currentOne = body!);
  }

  /**
   * Loads a paginated subset of records matching the filter.
   *
   * @param pageIndex - Page index to retrieve.
   * @param pageSize - Quantity of items per page.
   * @param filter - Query filter conditions.
   * @returns Object containing page data and total count.
   */
  async loadPage(pageIndex: number, pageSize: number, filter: F) {
    const { body } = await this.client.get<ListChunk<D>>(
      `${this.baseURI}?${buildURLData({ ...filter, pageIndex, pageSize })}`,
    );

    return { pageData: body!.list, totalCount: body!.count };
  }
}
