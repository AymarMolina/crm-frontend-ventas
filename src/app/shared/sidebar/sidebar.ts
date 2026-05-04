import { Component, Input, OnInit } from '@angular/core';
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
 
  collapsed = false;
  version = '1.0.0';
 
  constructor(public auth: AuthService) {}
 
  ngOnInit(): void {}
 
  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }
 
  logout(): void {
    this.auth.logout();
  }
}