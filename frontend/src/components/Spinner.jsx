export default function Spinner({ full }) {
  if (full) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',minHeight:200}}>
      <div className="spinner"/>
    </div>
  )
  return <div className="spinner" style={{display:'inline-block'}}/>
}
