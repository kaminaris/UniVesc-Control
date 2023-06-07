import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';

@BinarySerializable({ layout: 'sequential' })
export class VescSettings {
	@BinaryField({ size: 4, type: 'float' })
	wheelDiameter: number = 0.5;

	@BinaryField({ size: 4, type: 'float' })
	maxBatteryVoltage: number = 84;

	@BinaryField({ size: 4, type: 'float' })
	minBatteryVoltage: number = 60;

	@BinaryField({ size: 4, type: 'float' })
	motorPolePairs: number = 30;

	@BinaryField({ size: 4, type: 'float' })
	maxSpeed: number = 0;

	@BinaryField({ size: 4, type: 'float' })
	odo: number = 0;

	@BinaryField({ size: 4, type: 'float' })
	motorPulley: number = 1.0;

	@BinaryField({ size: 4, type: 'float' })
	wheelPulley: number = 1.0;

	@BinaryField({ size: 4, type: 'float' })
	maxMotorCurrent: number = 35.0;

	@BinaryField({ size: 4, type: 'float' })
	dutyWarning: number = 80.0;
}