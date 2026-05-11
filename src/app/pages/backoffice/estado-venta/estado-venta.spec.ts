import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoVenta } from './estado-venta';

describe('EstadoVenta', () => {
  let component: EstadoVenta;
  let fixture: ComponentFixture<EstadoVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoVenta],
    }).compileComponents();

    fixture = TestBed.createComponent(EstadoVenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
