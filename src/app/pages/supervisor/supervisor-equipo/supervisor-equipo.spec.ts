import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorEquipo } from './supervisor-equipo';

describe('SupervisorEquipo', () => {
  let component: SupervisorEquipo;
  let fixture: ComponentFixture<SupervisorEquipo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorEquipo],
    }).compileComponents();

    fixture = TestBed.createComponent(SupervisorEquipo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
