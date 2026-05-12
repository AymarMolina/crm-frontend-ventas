import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbigeoSelect } from './ubigeo-select';

describe('UbigeoSelect', () => {
  let component: UbigeoSelect;
  let fixture: ComponentFixture<UbigeoSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UbigeoSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(UbigeoSelect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
