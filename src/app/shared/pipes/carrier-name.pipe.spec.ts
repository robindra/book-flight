import { CarrierNamePipe } from './carrier-name.pipe';

describe('CarrierNamePipe', () => {
  it('create an instance', () => {
    const pipe = new CarrierNamePipe();
    expect(pipe).toBeTruthy();
  });
});
