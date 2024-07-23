import React from "react";
import Slider from "react-slick";
import ava01 from "../../assets/images/ava-1.jpg";
import ava02 from "../../assets/images/ava-2.jpg";
import ava03 from "../../assets/images/ava-3.jpg";

const Testimonial = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 1000,
    swipeToSlide: true,
    autoplaySpeed: 2000,
    slidesToShow: 3,

    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slideToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slideToScroll: 1,
        },
      },
    ],
  };

  return (
    <Slider {...settings}>
      <div className="testmonial py-4 px-3">
        <p>
          Vịnh Hạ Long là một di sản thiên nhiên thế giới nằm ở tỉnh Quảng Ninh,
          Việt Nam, nổi tiếng với cảnh quan hùng vĩ của hàng ngàn hòn đảo đá vôi
          lớn nhỏ rải rác trên mặt nước xanh biếc.
          <div className="d-flex align-items-center gap-4 mt-3">
            <img src={ava01} className="w-25 h-25 rounded-2" alt="" />
            <div>
              <h6 className="mb-0 mt-3">TAi Nguyen</h6>
              <p>Customer</p>
            </div>
          </div>
        </p>
      </div>
      <div className="testmonial py-4 px-3">
        <p>
          Vịnh Hạ Long là một di sản thiên nhiên thế giới nằm ở tỉnh Quảng Ninh,
          Việt Nam, nổi tiếng với cảnh quan hùng vĩ của hàng ngàn hòn đảo đá vôi
          lớn nhỏ rải rác trên mặt nước xanh biếc.
          <div className="d-flex align-items-center gap-4 mt-3">
            <img src={ava02} className="w-25 h-25 rounded-2" alt="" />
            <div>
              <h6 className="mb-0 mt-3">Hoài Nghĩa</h6>
              <p>Customer</p>
            </div>
          </div>
        </p>
      </div>
      <div className="testmonial py-4 px-3">
        <p>
          Vịnh Hạ Long là một di sản thiên nhiên thế giới nằm ở tỉnh Quảng Ninh,
          Việt Nam, nổi tiếng với cảnh quan hùng vĩ của hàng ngàn hòn đảo đá vôi
          lớn nhỏ rải rác trên mặt nước xanh biếc.
          <div className="d-flex align-items-center gap-4 mt-3">
            <img src={ava03} className="w-25 h-25 rounded-2" alt="" />
            <div>
              <h6 className="mb-0 mt-3">Tùng Lâm</h6>
              <p>Customer</p>
            </div>
          </div>
        </p>
      </div>
      <div className="testmonial py-4 px-3">
        <p>
          Vịnh Hạ Long là một di sản thiên nhiên thế giới nằm ở tỉnh Quảng Ninh,
          Việt Nam, nổi tiếng với cảnh quan hùng vĩ của hàng ngàn hòn đảo đá vôi
          lớn nhỏ rải rác trên mặt nước xanh biếc.
          <div className="d-flex align-items-center gap-4 mt-3">
            <img src={ava02} className="w-25 h-25 rounded-2" alt="" />
            <div>
              <h6 className="mb-0 mt-3">Hoài Nghĩa</h6>
              <p>Customer</p>
            </div>
          </div>
        </p>
      </div>
      <div className="testmonial py-4 px-3">
        <p>
          Vịnh Hạ Long là một di sản thiên nhiên thế giới nằm ở tỉnh Quảng Ninh,
          Việt Nam, nổi tiếng với cảnh quan hùng vĩ của hàng ngàn hòn đảo đá vôi
          lớn nhỏ rải rác trên mặt nước xanh biếc.
          <div className="d-flex align-items-center gap-4 mt-3">
            <img src={ava01} className="w-25 h-25 rounded-2" alt="" />
            <div>
              <h6 className="mb-0 mt-3">Hoàng Thanh</h6>
              <p>Customer</p>
            </div>
          </div>
        </p>
      </div>
    </Slider>
  );
};

export default Testimonial;
