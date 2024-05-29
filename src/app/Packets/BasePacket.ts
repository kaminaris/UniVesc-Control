import { BinaryField, BinarySerializable } from '../BinarySerializer';

export enum ResponseCode {
	OK = 7,
	FAIL,
	UNKNOWN_PACKET,
	PROGRESS,
	FILE,
	FILE_CONTENT,
}

export enum PacketType {
	// Base packets, built in
	PING = 1,
	GET_PLUGINS,
	GET_CHIP_INFO,
	RESTART,

	// Firmware update
	FIRMWARE_UPDATE,

	// Filesystem
	GET_FILESYSTEM_INFO,
	GET_FILE_LIST,
	GET_FILE,
	WRITE_FILE,
	DELETE_FILE,

	// Preferences
	GET_SETTING,
	SAVE_SETTING,
	LIST_SETTINGS,
}

export enum PreferenceType {
	PT_I8,
	PT_U8,
	PT_I16,
	PT_U16,
	PT_I32,
	PT_U32,
	PT_I64,
	PT_U64,
	PT_STR,
	PT_BLOB,
	PT_INVALID
}

@BinarySerializable({ layout: 'sequential' })
export class BasePacket {
	@BinaryField({ type: 'number', size: 1 })
	t = 0;
}

@BinarySerializable({ layout: 'sequential' })
export class BaseResponse {
	@BinaryField({ type: 'number', size: 1 })
	code: ResponseCode = 7;
}
