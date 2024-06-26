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

import { createCtr256State, ctr256, Ctr256State, destroyCtr256State } from "../0_deps.ts";

export class CTR {
  #key: Uint8Array;
  #state: Ctr256State;

  constructor(key: Uint8Array, iv: Uint8Array) {
    this.#state = createCtr256State(iv);
    this.#key = key;
  }

  /** This must not be called after destroying. */
  call(data: Uint8Array) {
    ctr256(data, this.#key, this.#state);
  }

  destroy() {
    destroyCtr256State(this.#state);
  }
}
