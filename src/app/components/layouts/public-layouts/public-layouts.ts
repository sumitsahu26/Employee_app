import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavbar } from '../../public-navbar/public-navbar';

@Component({
  selector: 'app-public-layouts',
  imports: [RouterOutlet, CommonModule, PublicNavbar],
  templateUrl: './public-layouts.html',
  styleUrl: './public-layouts.css',
})
export class PublicLayouts {

}
