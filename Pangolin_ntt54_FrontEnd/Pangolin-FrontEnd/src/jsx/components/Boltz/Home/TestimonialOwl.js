import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {Link} from 'react-router-dom';
   
import pic2 from './../../../../images/contacts/pic-2.jpg';
import pic3 from './../../../../images/contacts/pic-3.jpg';
import pic4 from './../../../../images/contacts/pic-4.jpg';
import pic5 from './../../../../images/contacts/pic-5.jpg';
import pic7 from './../../../../images/contacts/pic-7.jpg';

const TestimonialOwl = ({provideAddressToSendCoins}) =>{
	const settings = {
		dots: false,
		infinite: true,
		arrows: true,
		speed: 500,
		slidesToShow: 1,  //4,
		slidesToScroll: 1,
		responsive: [
			{
				breakpoint: 1600,
				settings: {
				  slidesToShow: 1,  //3
				  slidesToScroll: 1,
				  
				},
			},
			{
				breakpoint: 1024,
				settings: {
				  slidesToShow: 1,  //3
				  slidesToScroll: 1,				  
				},
			},
			
			{
				breakpoint: 768,
				settings: {
				  slidesToShow: 1,  //3
				  slidesToScroll: 1,
				},
			},
			{
				breakpoint: 400,
				settings: {
				  slidesToShow: 1,  //2
				  slidesToScroll: 1,
				},
			},
		],
	};
	return(
		<>
			<Slider className="testimonial-two px-4 owl-carousel contacts-slider" {...settings}>
				<div className="items">
					<div className="text-center" onClick={() => provideAddressToSendCoins("0x8731732996d815E34DA3eda6f13277a919b3d0d8")}>
						<img className="mb-3 rounded-circle mx-auto" src={pic5} alt="" />
						<h5 className="mb-0"><Link to={"#"} className="text-black">Martha</Link></h5>
						<span className="fs-18">0x8731732996d815E34DA3eda6f13277a919b3d0d8</span>
					</div>
				</div>
				<div className="items">
					<div className="text-center" onClick={() => provideAddressToSendCoins("0x563FD94f1A141a2289A5746b7A6f0bE9fB27daf0")}>
						<img className="mb-3 rounded-circle mx-auto" src={pic2} alt="" />
						<h5 className="mb-0"><Link to={"#"} className="text-black">Etienne</Link></h5>
						<span className="fs-18">0x563FD94f1A141a2289A5746b7A6f0bE9fB27daf0</span>
					</div>
				</div>
				<div className="items">
					<div className="text-center" onClick={() => provideAddressToSendCoins("0xB504b48Ad86b5946D2fD465e07E3A8F7Bb57F812")}>
						<img className="mb-3 rounded-circle mx-auto" src={pic3} alt="" />
						<h5 className="mb-0"><Link to={"#"} className="text-black" >David</Link></h5>
						<span className="fs-18">0xB504b48Ad86b5946D2fD465e07E3A8F7Bb57F812</span>
					</div>
				</div>
				<div className="items">
					<div className="text-center" onClick={() => provideAddressToSendCoins("0x96209E52eeFd97E317AADE43e18EBf240fBf7F40")}>
						<img className="mb-3 rounded-circle mx-auto" src={pic7} alt="" />
						<h5 className="mb-0"><Link to={"#"} className="text-black">Olivia</Link></h5>
						<span className="fs-18">0x96209E52eeFd97E317AADE43e18EBf240fBf7F40</span>
					</div>
				</div>
			</Slider>
		</>
	)
}
export default TestimonialOwl;