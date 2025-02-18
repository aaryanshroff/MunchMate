import { useNavigate } from 'react-router';

// TODO @dyasin: Don't display certain buttons if we are not admin
const Navbar = () => {
    let navigate = useNavigate();

    return (
        <div className='navbar bg-body-tertiary px-3 mb-3'>
            <ul clasName='nav nav-pills'>
                <div onClick={() => navigate('/')} className='btn'>
                    MunchMate
                </div>
                <div onClick={() => navigate('/add-restaurant')} className='btn btn-secondary'>
                    Add Restaurant
                </div>
            </ul>
        </div>
    );
}

export default Navbar;
