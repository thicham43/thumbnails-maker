import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { ThumbnailsMakerService } from '../services/thumbnails-maker.service';

@Component({
  selector: 'app-thumbnails-maker',
  templateUrl: './thumbnails-maker.component.html',
  styleUrls: ['./thumbnails-maker.component.scss']
})
export class ThumbnailsMakerComponent implements OnInit {

  img: any;
  img_url: any;
  msg = "";
  resolution_24: boolean = false;
  resolution_32: boolean = false;
  resolution_64: boolean = false;
  success = false;
  thumbnails_data: any[] = [];

  constructor(private thumbMakerService: ThumbnailsMakerService,
              private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }


  onChangeImg(event: any): void {
    let img = event.target.files[0];
		
		if (img.type.match(/image\/*/) == null) {
			this.msg = "Sorry! Only images are supported";
			return;
		}

    var reader = new FileReader();
		reader.readAsDataURL(img);
		reader.onload = (_event) => {
                                  this.msg = "";
                                  this.img_url = reader.result; 
                                }
    this.img = img;
  }

  onToggleResol_24(value: boolean): void {
    this.resolution_24 = value;
  }

  onToggleResol_32(value: boolean): void {
    this.resolution_32 = value;
  }

  onToggleResol_64(value: boolean): void {
    this.resolution_64 = value;
  }


  make_thumbnails(): void {
    if(!this.img || this.img.size == 0) {
			this.msg = 'You must select an image';
			return;
		}

    let target_resolutions: number[] = [];
    if(this.resolution_24) target_resolutions.push(24);
    if(this.resolution_32) target_resolutions.push(32);
    if(this.resolution_64) target_resolutions.push(64);

    if(target_resolutions.length == 0) {
			this.msg = 'Please select at least one target resolution!';
			return;
		}

    this.thumbMakerService.make_thumbnails(this.img, target_resolutions).subscribe(status => this.success = status);
  }

  show_thumbnails(): void {
    let img_name = this.img.name;

    if(this.resolution_24)
      this.thumbMakerService.get_thumbnail(img_name, 24).subscribe({  next: (resp: Blob) => { let thumb_url = window.URL.createObjectURL(resp);
                                                                                              let safe_url = this.sanitizer.bypassSecurityTrustResourceUrl(thumb_url);
                                                                                              this.thumbnails_data.push([safe_url, 24]);
                                                                                            },
                                                                      error: (err: any) => console.log(err)
                                                                    });
    if(this.resolution_32)
      this.thumbMakerService.get_thumbnail(img_name, 32).subscribe({  next: (resp: Blob) => { let thumb_url = window.URL.createObjectURL(resp);
                                                                                              let safe_url = this.sanitizer.bypassSecurityTrustResourceUrl(thumb_url);
                                                                                              this.thumbnails_data.push([safe_url, 32]);
                                                                                            },
                                                                      error: (err: any) => console.log(err)
                                                                    });
    if(this.resolution_64)
      this.thumbMakerService.get_thumbnail(img_name, 64).subscribe({  next: (resp: Blob) => { let thumb_url = window.URL.createObjectURL(resp);
                                                                                              let safe_url = this.sanitizer.bypassSecurityTrustResourceUrl(thumb_url);
                                                                                              this.thumbnails_data.push([safe_url, 64]);
                                                                                            },
                                                                      error: (err: any) => console.log(err)
                                                                    });
  }


}
