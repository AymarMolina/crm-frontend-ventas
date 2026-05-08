import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarSupervisor } from './asignar-supervisor';

describe('AsignarSupervisor', () => {
  let component: AsignarSupervisor;
  let fixture: ComponentFixture<AsignarSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarSupervisor],
    }).compileComponents();

    fixture = TestBed.createComponent(AsignarSupervisor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
