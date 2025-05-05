import React from 'react'
import '../css/nav.css'

const Nav = () => {
    const nav = ['home','register', 'update'];
  return (
    <div className='navcontainer'>
        <ul className='navgroup'>
        {nav.map(navItem=>(
            <li key={navItem} className='navItems'><a href={`/user/${navItem}`}>{navItem}</a></li>
          ))}
          <li key='logout' className='navItems'><a href='/logout'>LOGOUT</a></li>
      </ul>
    </div>
  )
}

export default Nav
