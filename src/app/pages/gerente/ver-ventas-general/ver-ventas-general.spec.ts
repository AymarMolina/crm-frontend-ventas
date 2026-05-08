import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerVentasGeneral } from './ver-ventas-general';

describe('VerVentasGeneral', () => {
  let component: VerVentasGeneral;
  let fixture: ComponentFixture<VerVentasGeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerVentasGeneral],
    }).compileComponents();

    fixture = TestBed.createComponent(VerVentasGeneral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
