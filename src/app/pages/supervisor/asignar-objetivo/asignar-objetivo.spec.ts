import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarObjetivo } from './asignar-objetivo';

describe('AsignarObjetivo', () => {
  let component: AsignarObjetivo;
  let fixture: ComponentFixture<AsignarObjetivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarObjetivo],
    }).compileComponents();

    fixture = TestBed.createComponent(AsignarObjetivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
