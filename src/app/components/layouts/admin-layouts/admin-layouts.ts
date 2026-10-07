import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../navbar/navbar';

@Component({
  selector: 'app-admin-layouts',
  imports: [RouterOutlet, Navbar],
  templateUrl: './admin-layouts.html',
  styleUrl: './admin-layouts.css',
})
export class AdminLayouts {

}
