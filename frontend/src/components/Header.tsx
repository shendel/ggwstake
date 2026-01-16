import { ConnectWalletButton } from '@/web3/ConnectWalletButton'
import { DisconnectWalletButton } from '@/web3/DisconnectWalletButton'

import React, { useState,useEffect } from "react";
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { fromWei } from '@/helpers/wei'

import Button from '@/components/ui/Button'

const formatUrl = (href) => {
  if (href.substr(0,1) == '/') return `#${href}`
  return href
}

import { MAINNET_CHAIN_ID } from '@/config'
import { GET_CHAIN_BYID } from '@/web3/chains'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const {
    injectedAccount,
    injectedChainId,
    balance
  } = useInjectedWeb3()
  
  const chainInfo = GET_CHAIN_BYID(MAINNET_CHAIN_ID)
  
  const isOwner = false

  const menuItems = window.GGW_STAKE_MENU || [
    {
      title: 'Home',
      url: '/'
    },
  ]
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const disconnectWallet = () => {
    setIsMenuOpen(false); // Закрываем меню после отключения
  };
  
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflowY = 'hidden'
    } else {
      document.body.style.overflowY = 'auto'
    }
  }, [ isMenuOpen ])
  const walletButtonClass = `flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2`
  
  const renderMenuItems = () => {
    return (
      <ul>
        {menuItems.map((item, key) => {
          const { title, url, childs } = item
          return (
            <li key={key} className={(childs && childs.length && childs.length > 0) ? 'menu-item-has-children' : ''}>
              <a href={url}>
                <span className="text-white">{title}</span>
              </a>
              {(childs && childs.length && childs.length > 0) && (
                <ul>
                  {childs.map((subItem, subKey) => {
                    const { title, url } = subItem
                    return (
                      <li key={subKey}>
                        <a href={url}>
                          <span className="text-white">{title}</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    )
  }
  
  return (
    <header className="p-4 flex items-center mainHeader">
      <div className="logo">
        <strong><a href="/">GGW Stake</a></strong>
      </div>
      <div className={`ggw_mobile_menu ${(isMenuOpen) ? '-opened' : ''}`} id="ggw_mobile_menu">
        <div className="ggw_mobile_menu_overlay" onClick={() => { setIsMenuOpen(false) }}></div>
        <div className="ggw_mobile_menu_holder">
          <div className="ggw_mobile_menu_button_holder">
            <div className="connectWalletMobileHolder">
              <ConnectWalletButton
                connectView={(isConnecting, openConnectModal) => {
                  return (
                    <button
                      disabled={isConnecting}
                      onClick={openConnectModal}
                      className="connectWalletButton"
                    >
                      Connect
                    </button>
                  )
                }}
                connectedView={(walletAddress, nms, openModal) => {
                  return (
                    <button
                      className="connectWalletButton"
                      onClick={openModal}
                    >
                      <span>{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
                    </button>
                  )
                }}
                wrongChainView={(openChainModal) => {
                  return (
                    <button
                      onClick={openChainModal}
                      className="connectWalletButton"
                    >
                      Switch chain
                    </button>
                  )
                }}
              />
            </div>
            <label className="hamburger" onClick={toggleMenu}>
              <div className="lines">
                <span className="line"></span>
                <span className="line"></span>
                <span className="line"></span>
              </div>
            </label>
          </div>
          <nav className="menu ggw_main_menu_mobile">
            {/* -------------------------- */}
            {renderMenuItems()}
            {/* ========================== */}
          </nav>
        </div>
      </div>
      
      <div className="ggw_main_menu_holder">
        <nav className="menu ggw_main_menu flex space-x-4">
          {renderMenuItems()}
        </nav>
        <div>
          <ConnectWalletButton
            connectView={(isConnecting, openConnectModal) => {
              return (
                <button
                  disabled={isConnecting}
                  onClick={openConnectModal}
                  className="connectWalletButton"
                >
                  Connect
                </button>
              )
            }}
            connectedView={(walletAddress, nms, openModal) => {
              return (
                <button
                  className="connectWalletButton"
                  onClick={openModal}
                >
                  <span>{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
                </button>
              )
            }}
            wrongChainView={(openChainModal) => {
              return (
                <button
                  onClick={openChainModal}
                  className="connectWalletButton"
                >
                  Switch chain
                </button>
              )
            }}
          />
        </div>
      </div>
    </header>
  )
};

export default Header;
