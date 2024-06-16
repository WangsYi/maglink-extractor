import { useEffect, useState } from "react"
import './styles/globals.css';

function Popup() {
  const [groupedLinks, setGroupedLinks] = useState<{ [key: string]: string[] }>({})
  const [selectedLinks, setSelectedLinks] = useState<{ [key: string]: boolean }>({})
  const [selectAll, setSelectAll] = useState<boolean>(false)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { action: "extractMagnetLinks" }, (response) => {
        if (response && response.magnetLinks) {
          const groups = response.magnetLinks.reduce((acc: any, link: string) => {
            const parent = link.split('/')[2] || ''//'No Parent'
            if (!acc[parent]) {
              acc[parent] = []
            }
            acc[parent].push(link)
            return acc
          }, {})
          setGroupedLinks(groups)
        }
      })
    })
  }, [])

  const handleSelectAll = () => {
    setSelectAll(!selectAll)
    const newSelectedLinks: { [key: string]: boolean } = {}
    Object.keys(groupedLinks).forEach((group) => {
      groupedLinks[group].forEach((link) => {
        newSelectedLinks[link] = !selectAll
      })
    })
    setSelectedLinks(newSelectedLinks)
  }

  const handleGroupSelect = (group: string) => {
    const newSelectedLinks = { ...selectedLinks }
    groupedLinks[group].forEach((link) => {
      newSelectedLinks[link] = !groupedLinks[group].every(link => selectedLinks[link])
    })
    setSelectedLinks(newSelectedLinks)
  }

  const handleLinkSelect = (link: string) => {
    setSelectedLinks({ ...selectedLinks, [link]: !selectedLinks[link] })
  }

  const handleCopy = () => {
    const linksToCopy = Object.keys(selectedLinks).filter(link => selectedLinks[link])
    navigator.clipboard.writeText(linksToCopy.join('\n'))
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-2">Magnet Links</h1>
      <button onClick={handleSelectAll} className="mb-4 bg-blue-500 text-white px-2 py-1 rounded">
        {selectAll ? "Deselect All" : "Select All"}
      </button>
      <div className="overflow-auto h-64">
        {Object.keys(groupedLinks).map((group) => (
          <div key={group} className="mb-2">
            {/* <div className="font-semibold">
              <input
                type="checkbox"
                aria-label={`Select group ${group}`}
                checked={groupedLinks[group].every(link => selectedLinks[link])}
                onChange={() => handleGroupSelect(group)}
              />
              {group}
            </div> */}
            <ul className="pl-4">
              {groupedLinks[group].map((link) => (
                <li key={link}>
                  <input
                    type="checkbox"
                    aria-label={`Select link ${link}`}
                    checked={selectedLinks[link] || false}
                    onChange={() => handleLinkSelect(link)}
                  />
                  <a href={link} target="_blank" rel="noopener noreferrer" className="ml-2">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button onClick={handleCopy} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
        Copy Selected Links
      </button>
    </div>
  )
}

export default Popup
