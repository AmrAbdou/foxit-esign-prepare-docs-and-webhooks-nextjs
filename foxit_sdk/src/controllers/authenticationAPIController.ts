/**
 * Foxit eSign testLib
 *
 * This file was automatically generated by APIMATIC v3.0 ( https://www.apimatic.io ).
 */

import { ApiResponse, RequestOptions } from '../core';
import {
  ContentTypeEnum,
  contentTypeEnumSchema,
} from '../models/contentTypeEnum';
import { GrantTypeEnum, grantTypeEnumSchema } from '../models/grantTypeEnum';
import { ScopeEnum, scopeEnumSchema } from '../models/scopeEnum';
import { string, unknown } from '../schema';
import { BaseController } from './baseController';

export class AuthenticationAPIController extends BaseController {
  /**
   * Generate your Access Token
   *
   * @param contentType
   * @param clientId
   * @param clientSecret
   * @param grantType
   * @param scope
   * @return Response from the API call
   */
  async generateAccessToken(
    contentType: ContentTypeEnum,
    clientId: string,
    clientSecret: string,
    grantType: GrantTypeEnum,
    scope: ScopeEnum,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<unknown>> {
    const req = this.createRequest('POST', '/oauth2/access_token');
    const mapped = req.prepareArgs({
      contentType: [contentType, contentTypeEnumSchema],
      clientId: [clientId, string()],
      clientSecret: [clientSecret, string()],
      grantType: [grantType, grantTypeEnumSchema],
      scope: [scope, scopeEnumSchema],
    });
    req.header('Content-Type', mapped.contentType);
    req.form({
      client_id: mapped.clientId,
      client_secret: mapped.clientSecret,
      grant_type: mapped.grantType,
      scope: mapped.scope,
    });
    req.authenticate(false);
    return req.callAsJson(unknown(), requestOptions);
  }
}
