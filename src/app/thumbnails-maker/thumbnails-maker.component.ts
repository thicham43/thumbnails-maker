import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Resolution, RESOLUTIONS } from '../_core/resolution';
import { ThumbnailsMakerService } from '../_core/services/thumbnails-maker.service';

@Component({
  selector: 'app-thumbnails-maker',
  templateUrl: './thumbnails-maker.component.html',
  styleUrls: ['./thumbnails-maker.component.scss']
})
export class ThumbnailsMakerComponent implements OnInit {

  image: any;
  image_url: any;
  msg = "";
  success = false;
  resolutions: Resolution[] = RESOLUTIONS;
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
                                  this.image_url = reader.result; 
                                }
    this.image = img;
  }

  onToggleResolution(resol: Resolution): void {
    resol.is_target = !resol.is_target;
  }


  make_thumbnails(): void {
    if(!this.image || this.image.size == 0) {
			this.msg = 'No image selected!';
			return;
		}
    let target_resolutions = this.resolutions.filter(r => r.is_target).map(r => r.width);

    if(target_resolutions.length == 0) {
			this.msg = 'Please select at least one target resolution!';
			return;
		}
    this.thumbMakerService.make_thumbnails(this.image, target_resolutions).subscribe(status => this.success = status);
  }


  show_thumbnails(): void {
    let img_name = this.image.name;
    let target_resolutions = this.resolutions.filter(r => r.is_target).map(r => r.width);
    
    for(let resol of target_resolutions) {
      this.thumbMakerService.get_thumbnail(img_name, resol).subscribe({ next: (resp: Blob) => { let thumb_url = window.URL.createObjectURL(resp);
                                                                                                let safe_url = this.sanitizer.bypassSecurityTrustResourceUrl(thumb_url);
                                                                                                this.thumbnails_data.push([safe_url, resol]);
                                                                                              },
                                                                        error: (err: any) => console.log(err)
                                                                      });
    }
    this.thumbnails_data.sort((r1, r2) => r1[1] > r2[1] ? 1 : -1);
  }


  reset(): void {
    this.image = null;
    this.image_url = null;
    this.success = false;
    this.thumbnails_data = [];
    this.resolutions.forEach(r => r.is_target = false);
  }


}
