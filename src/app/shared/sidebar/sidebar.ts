import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}
 
@Component({
  selector: 'app-sidebar',
  imports: [RouterModule,CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  @Input() items: NavItem[] = [];
  @Input() collapsed: boolean = false;
  @Output() collapsedChange = new EventEmitter<boolean>();


  version = '1.0.0';
 
  constructor(public auth: AuthService) {}
 
  ngOnInit(): void {}
 
  logout(): void {
    this.auth.logout();
  }
    toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed); // Le avisa al padre (AppComponent)
  }
}