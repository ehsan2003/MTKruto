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

import { unreachable } from "../0_deps.ts";
import { cleanObject } from "../1_utilities.ts";
import { enums, types } from "../2_tl.ts";
import { UsernameResolver } from "./_getters.ts";
import { constructKeyboardButton, KeyboardButton, keyboardButtonToTlObject } from "./1_keyboard_button.ts";
import { constructInlineKeyboardButton, InlineKeyboardButton, inlineKeyboardButtonToTlObject } from "./2_inline_keyboard_button.ts";

//

/** @unlisted */
export interface ReplyMarkupInlineKeyboard {
  inlineKeyboard: InlineKeyboardButton[][];
}

function constructInlineKeyboardMarkup(keyboard_: types.ReplyInlineMarkup): ReplyMarkupInlineKeyboard {
  const rows = new Array<InlineKeyboardButton[]>();
  for (const row_ of keyboard_.rows) {
    const row = new Array<InlineKeyboardButton>();
    for (const button_ of row_.buttons) {
      row.push(constructInlineKeyboardButton(button_));
    }
    rows.push(row);
  }
  return { inlineKeyboard: rows };
}

async function inlineKeyboardMarkupToTlObject(keyboard: ReplyMarkupInlineKeyboard, usernameResolver: UsernameResolver) {
  const rows_ = new Array<types.KeyboardButtonRow>();
  for (const row of keyboard.inlineKeyboard) {
    const row_ = new Array<enums.KeyboardButton>();
    for (const button of row) {
      row_.push(await inlineKeyboardButtonToTlObject(button, usernameResolver));
    }
    rows_.push(new types.KeyboardButtonRow({ buttons: row_ }));
  }
  return new types.ReplyInlineMarkup({ rows: rows_ });
}

//

/** @unlisted */
export interface ReplyMarkupKeyboard {
  keyboard: KeyboardButton[][];
  isPersistent?: boolean;
  resizeKeyboard?: boolean;
  oneTimeKeyboard?: boolean;
  inputFieldPlaceholder?: string;
  selective?: boolean;
}

function constructReplyKeyboardMarkup(keyboard_: types.ReplyKeyboardMarkup): ReplyMarkupKeyboard {
  const rows = new Array<KeyboardButton[]>();
  for (const row_ of keyboard_.rows) {
    const row = new Array<KeyboardButton>();
    for (const button_ of row_.buttons) {
      row.push(constructKeyboardButton(button_));
    }
    rows.push(row);
  }
  return {
    resizeKeyboard: keyboard_.resize || false,
    oneTimeKeyboard: keyboard_.single_use || false,
    selective: keyboard_.selective || false,
    isPersistent: keyboard_.persistent || false,
    keyboard: rows,
  };
}

function replyKeyboardMarkupToTlObject(replyMarkup: ReplyMarkupKeyboard) {
  const rows_ = new Array<types.KeyboardButtonRow>();
  for (const row of replyMarkup.keyboard) {
    const row_ = new Array<enums.KeyboardButton>();
    for (const button of row) {
      row_.push(keyboardButtonToTlObject(button));
    }
    rows_.push(new types.KeyboardButtonRow({ buttons: row_ }));
  }
  return new types.ReplyKeyboardMarkup({
    resize: replyMarkup.resizeKeyboard || undefined,
    single_use: replyMarkup.oneTimeKeyboard || undefined,
    selective: replyMarkup.selective || undefined,
    persistent: replyMarkup.isPersistent || undefined,
    rows: rows_,
    placeholder: replyMarkup.inputFieldPlaceholder,
  });
}

//

/**
 * Makes the user's client hide the current custom keyboard.
 * @unlisted
 */
export interface ReplyMarkupRemoveKeyboard {
  /** Differentiate from other reply markup types. */
  removeKeyboard: true;
  /** Whether to only affect specific users. If true, only users that were mentioned will be affected along with the author of the replied message if any. */
  selective?: boolean;
}

function constructReplyKeyboardRemove(replyMarkup_: types.ReplyKeyboardHide): ReplyMarkupRemoveKeyboard {
  return cleanObject({ removeKeyboard: true, selective: replyMarkup_.selective });
}

function replyKeyboardRemoveToTlObject(replyMarkup: ReplyMarkupRemoveKeyboard) {
  return new types.ReplyKeyboardHide({ selective: replyMarkup.selective || undefined });
}

//

/**
 * Forces the user's client to select the message as the one that is to be replied.
 * @unlisted
 */
export interface ReplyMarkupForceReply {
  /** Differentiate from other reply markup types. */
  forceReply: true;
  /** A placeholder to be shown in the client's message box. */
  inputFieldPlaceholder?: string;
  /** Whether to only affect specific users. If true, only users that were mentioned will be affected along with the author of the replied message if any. */
  selective?: boolean;
}

function constructForceReply(replyMarkup_: types.ReplyKeyboardForceReply) {
  const replyMarkup: ReplyMarkupForceReply = { forceReply: true };
  if (replyMarkup_.placeholder) {
    replyMarkup.inputFieldPlaceholder = replyMarkup_.placeholder;
  }
  if (replyMarkup_.selective) {
    replyMarkup.selective = true;
  }
  return replyMarkup;
}

function forceReplyToTlObject(replyMarkup: ReplyMarkupForceReply) {
  return new types.ReplyKeyboardForceReply({
    selective: replyMarkup.selective || undefined,
    placeholder: replyMarkup.inputFieldPlaceholder,
  });
}

//

/** A message's reply markup. */
export type ReplyMarkup = ReplyMarkupInlineKeyboard | ReplyMarkupKeyboard | ReplyMarkupRemoveKeyboard | ReplyMarkupForceReply;

export function constructReplyMarkup(replyMarkup: enums.ReplyMarkup): ReplyMarkup {
  if (replyMarkup instanceof types.ReplyKeyboardMarkup) {
    return constructReplyKeyboardMarkup(replyMarkup);
  } else if (replyMarkup instanceof types.ReplyInlineMarkup) {
    return constructInlineKeyboardMarkup(replyMarkup);
  } else if (replyMarkup instanceof types.ReplyKeyboardHide) {
    return constructReplyKeyboardRemove(replyMarkup);
  } else if (replyMarkup instanceof types.ReplyKeyboardForceReply) {
    return constructForceReply(replyMarkup);
  } else {
    unreachable();
  }
}

export async function replyMarkupToTlObject(replyMarkup: ReplyMarkup, usernameResolver: UsernameResolver): Promise<enums.ReplyMarkup> {
  if ("inlineKeyboard" in replyMarkup) {
    return await inlineKeyboardMarkupToTlObject(replyMarkup, usernameResolver);
  } else if ("keyboard" in replyMarkup) {
    return replyKeyboardMarkupToTlObject(replyMarkup);
  } else if ("removeKeyboard" in replyMarkup) {
    return replyKeyboardRemoveToTlObject(replyMarkup);
  } else if ("forceReply" in replyMarkup) {
    return forceReplyToTlObject(replyMarkup);
  } else {
    unreachable();
  }
}
