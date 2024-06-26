/**
 * MTKruto - Cross-runtime JavaScript library for building Telegram clients
 * Copyright (C) 2023-2024 Roj <https://roj.im/>
 *
 * This file is part of MTKruto.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { as, enums, types } from "../2_tl.ts";
import { constructBusinessConnection, Update } from "../3_types.ts";
import { C } from "./0_types.ts";

export type BusinessConnectionManagerUpdate = types.UpdateBotBusinessConnect;

export class BusinessConnectionManager {
  #c: C;

  constructor(c: C) {
    this.#c = c;
  }

  async getBusinessConnection(id: string) {
    const connection_ = await this.#c.messageStorage.getBusinessConnection(id);
    if (!connection_) {
      const connection_ = await this.#c.api.account.getBotBusinessConnection({ connection_id: id })
        .then((v) => v[as](types.Updates))
        .then((v) => v.updates[0][as](types.UpdateBotBusinessConnect).connection);
      await this.#c.messageStorage.setBusinessConnection(id, connection_);
      return await constructBusinessConnection(connection_, this.#c.getEntity);
    } else {
      return await constructBusinessConnection(connection_, this.#c.getEntity);
    }
  }

  static canHandleUpdate(update: enums.Update): update is BusinessConnectionManagerUpdate {
    return update instanceof types.UpdateBotBusinessConnect;
  }

  async handleUpdate(update: BusinessConnectionManagerUpdate): Promise<Update> {
    if (update.connection.disabled) {
      await this.#c.messageStorage.setBusinessConnection(update.connection.connection_id, null);
    } else {
      await this.#c.messageStorage.setBusinessConnection(update.connection.connection_id, update.connection);
    }
    const businessConnection = await constructBusinessConnection(update.connection, this.#c.getEntity);
    return { businessConnection };
  }
}
