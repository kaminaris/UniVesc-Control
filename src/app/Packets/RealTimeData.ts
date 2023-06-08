import { BinaryField, BinarySerializable } from 'src/app/BinarySerializer';

@BinarySerializable({ layout: 'sequential' })
export class RealTimeData {

	@BinaryField({ type: 'float', size: 4 })
	tachometer = 0;

	@BinaryField({ type: 'float', size: 4 })
	rpm = 0;

	@BinaryField({ type: 'float', size: 4 })
	distance = 0;

	@BinaryField({ type: 'float', size: 4 })
	velocity = 0;

	@BinaryField({ type: 'float', size: 4 })
	batPercentage = 0;

	@BinaryField({ type: 'float', size: 4 })
	motorTemp = 0;

	@BinaryField({ type: 'float', size: 4 })
	mosfetTemp = 0;

	@BinaryField({ type: 'float', size: 4 })
	powerWatt = 0;

	@BinaryField({ type: 'float', size: 4 })
	powerPercent = 0;

	@BinaryField({ type: 'float', size: 4 })
	voltage = 0;

	@BinaryField({ type: 'float', size: 4 })
	duty = 0;

	@BinaryField({ type: 'float', size: 4 })
	wattHours = 0;

	@BinaryField({ type: 'float', size: 4 })
	avgSpeed = 0;

	@BinaryField({ type: 'float', size: 4 })
	origOdo = 0;
}