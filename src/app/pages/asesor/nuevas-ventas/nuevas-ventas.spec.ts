import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevasVentas } from './nuevas-ventas';

describe('NuevasVentas', () => {
  let component: NuevasVentas;
  let fixture: ComponentFixture<NuevasVentas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevasVentas],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevasVentas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
