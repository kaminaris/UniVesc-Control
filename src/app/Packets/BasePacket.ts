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
	PING = 1,
	GET_CLOCK,
	GET_EEPROM,
	SET_EEPROM,
	FIRMWARE_UPDATE,
	GET_CHIP_INFO,
	RESTART,
	GET_FILE_LIST,
	GET_FILE,
	WRITE_FILE,
	DELETE_FILE,
	BEEP_TEST,
	SET_VOLUME,
	PLAY,
	GET_SETTINGS,
	SAVE_SETTINGS,
	GET_FILESYSTEM_INFO,
	GET_REALTIME_DATA
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
