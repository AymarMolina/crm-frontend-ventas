import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCampana } from './crear-campana';

describe('CrearCampana', () => {
  let component: CrearCampana;
  let fixture: ComponentFixture<CrearCampana>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCampana],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearCampana);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
