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
import { cleanObject, fromUnixTimestamp } from "../1_utilities.ts";
import { types } from "../2_tl.ts";
import { EntityGetter } from "./_getters.ts";
import { constructChatP } from "./1_chat_p.ts";
import { ChatP } from "./1_chat_p.ts";
import { constructUser, User } from "./1_user.ts";
import { ChatMember, constructChatMember } from "./2_chat_member.ts";
import { constructInviteLink, InviteLink } from "./2_invite_link.ts";

/** Changes made to a chat member. */
export interface ChatMemberUpdated {
  /** The chat in which the change was made. */
  chat: ChatP;
  /** The one who made the change. */
  from: User;
  /** The point of time in which the chat member's status was changed. */
  date: Date;
  /** The old status of the chat member. */
  oldChatMember: ChatMember;
  /** The new status of the chat member. */
  newChatMember: ChatMember;
  /** The invite link used to join. */
  inviteLink?: InviteLink;
  /** Whether the user joined from a shared folder. */
  viaSharedFolder?: boolean;
}

export async function constructChatMemberUpdated(update: types.UpdateChannelParticipant | types.UpdateChatParticipant, getEntity: EntityGetter): Promise<ChatMemberUpdated> {
  if (!update.prev_participant && !update.new_participant) {
    unreachable();
  }
  const chat_ = await getEntity("channel_id" in update ? new types.PeerChannel(update) : new types.PeerChat(update));
  const from_ = await getEntity(new types.PeerUser({ user_id: update.actor_id }));
  if (!chat_ || !from_) {
    unreachable();
  }
  const userPeer = new types.PeerUser(update);
  const chat = constructChatP(chat_);
  const from = constructUser(from_);
  const date = fromUnixTimestamp(update.date);
  const oldChatMember = await constructChatMember(update.prev_participant ?? new types.ChannelParticipantLeft({ peer: userPeer }), getEntity);
  const newChatMember = await constructChatMember(update.new_participant ?? new types.ChannelParticipantLeft({ peer: userPeer }), getEntity);
  const viaSharedFolder = "via_chatlist" in update ? update.via_chatlist ? true : update.invite ? false : undefined : undefined;
  const inviteLink = (update.invite && update.invite instanceof types.ChatInviteExported) ? await constructInviteLink(update.invite, getEntity) : undefined;
  return cleanObject({
    chat,
    from,
    date,
    oldChatMember,
    newChatMember,
    viaSharedFolder,
    inviteLink,
  });
}
