import { BinaryField } from '../BinarySerializer';

export enum NvsType {
	NVS_TYPE_U8 = 0x01,  /*!< Type uint8_t */
	NVS_TYPE_I8 = 0x11,  /*!< Type int8_t */
	NVS_TYPE_U16 = 0x02,  /*!< Type uint16_t */
	NVS_TYPE_I16 = 0x12,  /*!< Type int16_t */
	NVS_TYPE_U32 = 0x04,  /*!< Type uint32_t */
	NVS_TYPE_I32 = 0x14,  /*!< Type int32_t */
	NVS_TYPE_U64 = 0x08,  /*!< Type uint64_t */
	NVS_TYPE_I64 = 0x18,  /*!< Type int64_t */
	NVS_TYPE_STR = 0x21,  /*!< Type string */
	NVS_TYPE_BLOB = 0x42,  /*!< Type blob */
	NVS_TYPE_ANY = 0xff   /*!< Must be last */
};

export class PreferenceItemPacket {
	@BinaryField({ size: 16, type: 'string', stripNulls: true })
	namespace: string = '';

	@BinaryField({ size: 16, type: 'string', stripNulls: true })
	key: string = '';

	@BinaryField({ type: 'number', size: 4 })
	type: NvsType = 1;
}