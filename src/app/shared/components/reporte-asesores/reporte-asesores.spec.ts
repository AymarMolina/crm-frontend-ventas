import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAsesores } from './reporte-asesores';

describe('ReporteAsesores', () => {
  let component: ReporteAsesores;
  let fixture: ComponentFixture<ReporteAsesores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteAsesores],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteAsesores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
