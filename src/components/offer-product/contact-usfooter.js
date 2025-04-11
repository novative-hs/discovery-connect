import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandHoldingHeart } from '@fortawesome/free-solid-svg-icons';

const ContactusFooter = () => {
  return (
    <div className='bg-light style={{  color: 'white', padding: '4rem 0' }}>
      <Container>
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-start">
              <div style={{ fontSize: '3rem', marginRight: '1rem' }}>
                {/* Use FontAwesomeIcon component */}
                <FontAwesomeIcon icon={faHandHoldingHeart} />
              </div>
              <div>
                <h2 className="fw-bold">Fuel groundbreaking medical research!</h2>
                <p className="mt-3 fs-5">
                  Your donation powers the future of medicine and helps save lives.
                </p>
              </div>
            </div>
          </Col>
          <Col md={4} className="text-md-end mt-4 mt-md-0">
            <Button
              variant="primary"
              size="lg"
              style={{
                backgroundColor: '#0156C2',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.75rem 2rem',
                fontSize: '1.25rem',
              }}
              onClick={() => {router.push('/contact')}}
            >
              Contact us
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactusFooter;
